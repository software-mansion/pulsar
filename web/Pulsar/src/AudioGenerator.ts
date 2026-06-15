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
const ATTACK_SECONDS = 0.003;
const RELEASE_SECONDS = 0.03;

/**
 * Web haptics cannot vary the motor's intensity or pitch — `navigator.vibrate`
 * only controls *when* the motor is on. The vibration motor itself runs at a
 * single fixed resonant frequency and a single fixed amplitude. The audio
 * simulation honours that exactly: every "on" window is rendered as the *same*
 * buzz, and only its position and length change. Intensity and frequency reach
 * the listener purely through the PWM timing produced by PatternComposer
 * (longer shots = stronger, tighter shots = buzzier), never through pitch or
 * loudness varying between shots.
 *
 * To stop the buzz sounding like a flat electronic test tone, each "on" window
 * borrows the percussive character of the docs/Figma `AudioPatternUtility`
 * renderer: a short onset frequency sweep ("spin-up") settling onto the fixed
 * carrier, layered detuned partials, and a soft attack/release. This is *more*
 * faithful to a real fixed-frequency motor — which has a mechanical spin-up
 * transient — than a perfectly steady sine. Crucially, that character is
 * identical on every shot, so the constraint still holds: only the timing
 * carries information.
 */
const CARRIER_FREQUENCY_HZ = 180;
const PULSE_VOLUME = 0.5;

/**
 * The onset "spin-up" transient, mirroring how the docs renderer sweeps each
 * event's pitch (`initial -> final`). Every pulse starts a fixed multiple above
 * the carrier and chirps down onto it over a fixed time, giving a percussive
 * body instead of a flat tone. Because the overshoot, the target, and the sweep
 * length are all constants, the transient is the same on every shot.
 */
const ONSET_FREQUENCY_RATIO = 1.9;
const ONSET_DECAY_SECONDS = 0.04;

/**
 * A fixed timbre for the motor buzz. The same partials are layered on top of
 * every pulse so the spectral content never changes between shots — only the
 * timing does. The slightly detuned, docs-style stack (fundamental, a fifth
 * above, and a sub) reads as a textured actuator buzz rather than a clean
 * musical note.
 */
const BUZZ_HARMONICS = [
  { multiplier: 1, volumeScale: 1, waveform: "sine" },
  { multiplier: 1.5, volumeScale: 0.35, waveform: "sine" },
  { multiplier: 0.3, volumeScale: 0.4, waveform: "sine" },
] as const satisfies readonly {
  multiplier: number;
  volumeScale: number;
  waveform: OscillatorType;
}[];

class AudioGenerator {
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
    filterNode.frequency.setValueAtTime(900, offlineContext.currentTime);
    filterNode.Q.setValueAtTime(1.2, offlineContext.currentTime);
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
    // Every "on" window is the exact same buzz: a fixed carrier frequency at a
    // fixed amplitude, with a fixed onset chirp. Nothing here reads
    // interval.duration to change pitch or loudness between shots — duration
    // only controls how long the oscillators run, mirroring how
    // navigator.vibrate can only gate a fixed-frequency motor on and off.
    const startTime = interval.start / 1000;
    const stopTime = (interval.start + interval.duration) / 1000;
    const durationSeconds = interval.duration / 1000;
    // The chirp settles within the pulse, never overrunning a short one.
    const sweepEndTime = startTime + Math.min(ONSET_DECAY_SECONDS, durationSeconds);

    for (const harmonic of BUZZ_HARMONICS) {
      const steadyFrequency = CARRIER_FREQUENCY_HZ * harmonic.multiplier;
      const onsetFrequency = steadyFrequency * ONSET_FREQUENCY_RATIO;

      const oscillator = offlineContext.createOscillator();
      oscillator.type = harmonic.waveform;
      // Identical "spin-up" on every shot: a fixed overshoot chirping down onto
      // the fixed steady carrier, which then holds for the rest of the window.
      oscillator.frequency.setValueAtTime(onsetFrequency, startTime);
      oscillator.frequency.exponentialRampToValueAtTime(steadyFrequency, sweepEndTime);

      const gainNode = offlineContext.createGain();
      this.applyEnvelope(gainNode, interval, PULSE_VOLUME * harmonic.volumeScale);

      oscillator.connect(gainNode);
      gainNode.connect(targetNode);

      oscillator.start(startTime);
      oscillator.stop(stopTime);
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
}

export { AudioGenerator };
export type { AudioBufferInfo };
