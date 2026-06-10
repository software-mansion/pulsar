import { getHapticTimingCapabilities } from "./Engine.ts";
import { PatternComposer } from "./PatternComposer.ts";
import Settings from "./Settings.ts";
import type { HapticPattern, ParsedPattern } from "./types.ts";

type AudioInterval = {
  start: number;
  duration: number;
};

type WebAudioGlobal = typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
  OfflineAudioContext?: typeof OfflineAudioContext;
};

type AudioBufferInfo = {
  duration: number;
  sampleRate: number;
  length: number;
  channels: number;
  renderedBuffer: AudioBuffer;
};

const DEFAULT_SAMPLE_RATE = 44_100;
const TAIL_PADDING_MS = 60;
const MASTER_GAIN = 0.7;
const ATTACK_SECONDS = 0.002;
const RELEASE_SECONDS = 0.02;

// Lowpass filter shaping the whole mix. Mirrors the documentation reference
// implementation (docs/.../Preset/audio-player.ts) so the web preview matches
// the source-of-truth timbre instead of sounding bright and buzzy.
const FILTER_FREQUENCY = 700;
const FILTER_Q = 5;

// Component waves summed per vibration interval. These mirror the continuous
// synthesis in the documentation reference (`generateContinuousAudioConfig`):
// a sustained vibration block layers a sine fundamental, a quiet low sub, and a
// sine at the base frequency. `frequencyScale` and `volumeScale` correspond to
// the reference `createComponentWave(amplitudeModifier, frequencyModifier, type)`.
const COMPONENT_WAVES = [
  { frequencyScale: 0.8, volumeScale: 0.6, waveform: "sine" },
  { frequencyScale: 0.4, volumeScale: 0.2, waveform: "triangle" },
  { frequencyScale: 1, volumeScale: 0.5, waveform: "sine" },
] as const satisfies readonly {
  frequencyScale: number;
  volumeScale: number;
  waveform: OscillatorType;
}[];

class AudioGenerator {
  private readonly timingCapabilities = getHapticTimingCapabilities();
  private readonly patternComposer = new PatternComposer();
  private audioContext: AudioContext | null = null;
  private renderedBuffer: AudioBuffer | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private sampleRate = DEFAULT_SAMPLE_RATE;

  /**
   * Compiles a haptic pattern into an audio simulation that mirrors
   * the actual web vibration timing produced by PatternComposer.
   */
  public async parse(pattern: HapticPattern) {
    if (!this.isAudioAvailable()) {
      this.renderedBuffer = null;
      return null;
    }

    const parsedPattern = this.patternComposer.parse(pattern);
    const intervals = this.toIntervals(parsedPattern);

    if (intervals.length === 0) {
      this.renderedBuffer = null;
      return null;
    }

    await this.initAudioContext();
    this.renderedBuffer = await this.renderBuffer(intervals);

    return this.renderedBuffer;
  }

  /**
   * Plays the last rendered audio simulation buffer.
   */
  public async play() {
    if (!Settings.isSoundEnabled() || !this.audioContext || !this.renderedBuffer) {
      return false;
    }

    this.stop();

    const source = this.audioContext.createBufferSource();
    source.buffer = this.renderedBuffer;
    source.connect(this.audioContext.destination);
    source.start();
    this.currentSource = source;

    return new Promise<boolean>((resolve) => {
      source.onended = () => {
        if (this.currentSource === source) {
          this.currentSource = null;
        }
        resolve(true);
      };
    });
  }

  public stop() {
    if (!this.currentSource) {
      return false;
    }

    this.currentSource.stop();
    this.currentSource = null;
    return true;
  }

  public isPlaying() {
    return this.currentSource !== null;
  }

  public getBufferInfo(): AudioBufferInfo | null {
    if (!this.renderedBuffer) {
      return null;
    }

    return {
      duration: this.renderedBuffer.duration,
      sampleRate: this.renderedBuffer.sampleRate,
      length: this.renderedBuffer.length,
      channels: this.renderedBuffer.numberOfChannels,
      renderedBuffer: this.renderedBuffer,
    };
  }

  private async initAudioContext() {
    if (this.audioContext !== null) {
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }
      return;
    }

    const webAudioGlobal = globalThis as WebAudioGlobal;
    const AudioContextConstructor = webAudioGlobal.AudioContext ?? webAudioGlobal.webkitAudioContext;

    if (!AudioContextConstructor) {
      throw new Error("Web Audio API is not available in this environment.");
    }

    this.audioContext = new AudioContextConstructor();
    this.sampleRate = this.audioContext.sampleRate || DEFAULT_SAMPLE_RATE;

    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }
  }

  private isAudioAvailable() {
    const webAudioGlobal = globalThis as WebAudioGlobal;

    return (
      typeof globalThis !== "undefined" &&
      (
        typeof webAudioGlobal.AudioContext !== "undefined" ||
        typeof webAudioGlobal.webkitAudioContext !== "undefined"
      ) &&
      typeof webAudioGlobal.OfflineAudioContext !== "undefined"
    );
  }

  private async renderBuffer(intervals: AudioInterval[]) {
    const webAudioGlobal = globalThis as WebAudioGlobal;
    const OfflineAudioContextConstructor = webAudioGlobal.OfflineAudioContext;

    if (!OfflineAudioContextConstructor) {
      throw new Error("OfflineAudioContext is not available in this environment.");
    }

    const totalDurationSeconds = this.getTotalDurationSeconds(intervals);
    const totalFrameCount = Math.max(1, Math.ceil(totalDurationSeconds * this.sampleRate));
    const offlineContext = new OfflineAudioContextConstructor(1, totalFrameCount, this.sampleRate);

    const masterGain = offlineContext.createGain();
    masterGain.gain.value = MASTER_GAIN;
    masterGain.connect(offlineContext.destination);

    const filterNode = offlineContext.createBiquadFilter();
    filterNode.type = "lowpass";
    filterNode.frequency.setValueAtTime(FILTER_FREQUENCY, offlineContext.currentTime);
    filterNode.Q.setValueAtTime(FILTER_Q, offlineContext.currentTime);
    filterNode.connect(masterGain);

    for (const interval of intervals) {
      this.renderInterval(offlineContext, filterNode, interval);
    }

    return offlineContext.startRendering();
  }

  private renderInterval(
    offlineContext: OfflineAudioContext,
    targetNode: AudioNode,
    interval: AudioInterval,
  ) {
    const normalizedDuration = this.normalizeIntervalDuration(interval.duration);
    const baseFrequency = this.lerp(220, 95, normalizedDuration);
    const volume = this.lerp(0.14, 0.42, normalizedDuration);

    for (const componentWave of COMPONENT_WAVES) {
      const oscillator = offlineContext.createOscillator();
      oscillator.type = componentWave.waveform;
      oscillator.frequency.setValueAtTime(
        baseFrequency * componentWave.frequencyScale,
        interval.start / 1000,
      );

      const gainNode = offlineContext.createGain();
      this.applyEnvelope(gainNode, interval, volume * componentWave.volumeScale);

      oscillator.connect(gainNode);
      gainNode.connect(targetNode);

      oscillator.start(interval.start / 1000);
      oscillator.stop((interval.start + interval.duration) / 1000);
    }
  }

  private applyEnvelope(gainNode: GainNode, interval: AudioInterval, volume: number) {
    const startTime = interval.start / 1000;
    const durationSeconds = interval.duration / 1000;
    const attack = Math.min(ATTACK_SECONDS, durationSeconds / 3);
    const release = Math.min(RELEASE_SECONDS, Math.max(0.001, durationSeconds / 2));
    const sustainEndTime = Math.max(startTime + attack, startTime + durationSeconds - release);
    const endTime = startTime + durationSeconds;

    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + attack);
    gainNode.gain.setValueAtTime(volume, sustainEndTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, endTime);
  }

  private toIntervals(pattern: ParsedPattern): AudioInterval[] {
    const intervals: AudioInterval[] = [];
    let cursor = 0;
    let isVibrating = true;

    for (const duration of pattern) {
      if (isVibrating && duration > 0) {
        intervals.push({
          start: cursor,
          duration,
        });
      }

      cursor += duration;
      isVibrating = !isVibrating;
    }

    return intervals;
  }

  private getTotalDurationSeconds(intervals: AudioInterval[]) {
    const lastInterval = intervals[intervals.length - 1];

    if (!lastInterval) {
      return TAIL_PADDING_MS / 1000;
    }

    return (lastInterval.start + lastInterval.duration + TAIL_PADDING_MS) / 1000;
  }

  private normalizeIntervalDuration(duration: number) {
    const { minPulseMs, maxPulseMs } = this.timingCapabilities;
    const clampedDuration = Math.max(minPulseMs, Math.min(maxPulseMs, duration));

    if (maxPulseMs === minPulseMs) {
      return 0;
    }

    return (clampedDuration - minPulseMs) / (maxPulseMs - minPulseMs);
  }

  private lerp(start: number, end: number, amount: number) {
    return start + (end - start) * amount;
  }
}

export { AudioGenerator };
export type { AudioBufferInfo };
