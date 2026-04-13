import type { Pattern } from './types';

type DiscreteAudioConfig = {
  oscillator: {
    frequency: {
      initial: number;
      final: number;
      decay_time: number;
    };
    envelope: {
      attack: number;
      decay: number;
      sustain_level: number;
      sustain_duration: number;
      release: number;
    };
    waveform: string;
  };
  timestamp: number;
  volume: number;
};

type ContinuousAudioConfig = {
  type: string;
  data: {
    amplitude: { time: number; value: number }[];
    frequency: { time: number; value: number }[];
  };
};

type AudioPatternConfig = {
  discreteData: DiscreteAudioConfig[];
  continuousData: ContinuousAudioConfig[];
};

export class AudioEngine {
  audioContext: AudioContext | null;
  offlineContext: OfflineAudioContext | null;
  renderedBuffer: AudioBuffer | null;
  currentSource: AudioBufferSourceNode | null;
  sampleRate: number;
  isInitialized: boolean;

  constructor() {
    this.audioContext = null;
    this.offlineContext = null;
    this.renderedBuffer = null;
    this.currentSource = null;
    this.sampleRate = 44100;
    this.isInitialized = false;
  }

  public async parsePattern(pattern: Pattern) {
    this.renderedBuffer = null;
    await this.initAudioContext();
    await this.renderPattern({
      discreteData: this.generateDiscreteAudioConfig(pattern),
      continuousData: this.generateContinuousAudioConfig(pattern),
    });
  }

  public async play() {
    if (!this.renderedBuffer) {
      throw new Error('No audio buffer to play. Call parsePattern() first.');
    }

    this.stop();

    this.currentSource = this.audioContext!.createBufferSource();
    this.currentSource.buffer = this.renderedBuffer;
    this.currentSource.connect(this.audioContext!.destination);
    this.currentSource.start();

    return new Promise<void>((resolve) => {
      this.currentSource!.onended = () => {
        this.currentSource = null;
        resolve();
      };
    });
  }

  public stop() {
    if (this.currentSource) {
      this.currentSource.stop();
      this.currentSource = null;
    }
  }

  public isPlaying() {
    return this.currentSource !== null;
  }

  private async initAudioContext() {
    if (!this.isInitialized) {
      const AudioContextConstructor =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextConstructor();
      this.isInitialized = true;
    }

    if (this.audioContext!.state === 'suspended') {
      await this.audioContext!.resume();
    }
  }

  private generateDiscreteAudioConfig(pattern: Pattern): DiscreteAudioConfig[] {
    const discreteData: DiscreteAudioConfig[] = [];

    function alignVolume(x: number, sources: number) {
      return 0.1 / sources + (0.9 / sources) * x;
    }

    const sources = 3;
    const maxFrequency = 440;
    const minFrequency = 60;

    function normalizeFrequency(value: number) {
      return minFrequency + (maxFrequency - minFrequency) * value;
    }

    for (const bar of pattern.discretePattern) {
      const baseFrequency = normalizeFrequency(bar.frequency);
      const targetFrequency = baseFrequency * 0.2;
      discreteData.push({
        oscillator: {
          frequency: { initial: baseFrequency, final: targetFrequency, decay_time: 0.028 },
          envelope: { attack: 0.002, decay: 0, sustain_level: 1, sustain_duration: 0, release: 0.014 },
          waveform: 'sine',
        },
        timestamp: bar.time,
        volume: alignVolume(bar.amplitude, sources),
      });

      const harmonic1 = baseFrequency * 1.5;
      const targetHarmonic1 = harmonic1 * 0.4;
      discreteData.push({
        oscillator: {
          frequency: { initial: harmonic1, final: targetHarmonic1, decay_time: 0.031 },
          envelope: { attack: 0, decay: 0, sustain_level: 1, sustain_duration: 0, release: 0.015 },
          waveform: 'sine',
        },
        timestamp: bar.time,
        volume: alignVolume(bar.amplitude, sources),
      });

      const harmonic2 = baseFrequency * 0.3;
      const targetHarmonic2 = harmonic2 * 0.5;
      discreteData.push({
        oscillator: {
          frequency: { initial: harmonic2, final: targetHarmonic2, decay_time: 0.039 },
          envelope: { attack: 0.005, decay: 0, sustain_level: 1, sustain_duration: 0, release: 0.018 },
          waveform: 'sine',
        },
        timestamp: bar.time,
        volume: alignVolume(bar.amplitude, sources),
      });
    }

    return discreteData;
  }

  private generateContinuousAudioConfig(pattern: Pattern): ContinuousAudioConfig[] {
    function normalizeFrequency(x: number) {
      return 80 + (230 - 80) * x;
    }

    function createComponentWave(amplitudeModifier: number, frequencyModifier: number, type: string = 'sine') {
      const line: ContinuousAudioConfig = { data: { amplitude: [], frequency: [] }, type };

      for (const amplitudePoint of pattern.continuousPattern.amplitude) {
        line.data.amplitude.push({ time: amplitudePoint.time, value: amplitudePoint.value * amplitudeModifier });
      }
      for (const frequencyPoint of pattern.continuousPattern.frequency) {
        line.data.frequency.push({ time: frequencyPoint.time, value: normalizeFrequency(frequencyPoint.value) * frequencyModifier });
      }

      return line;
    }

    return [
      createComponentWave(0.6, 0.8, 'sine'),
      createComponentWave(0.2, 0.4, 'triangle'),
      createComponentWave(0.5, 1, 'sine'),
    ];
  }

  private async renderPattern(data: AudioPatternConfig) {
    const { discreteData, continuousData } = data;
    const [continuousDuration, , totalDuration] = this.calculateTotalDuration(data);

    this.offlineContext = new OfflineAudioContext(1, totalDuration, this.sampleRate);

    const masterGainNode = this.offlineContext.createGain();
    masterGainNode.gain.value = 1.0;
    masterGainNode.connect(this.offlineContext.destination);

    const filterNode = this.offlineContext.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(700, this.offlineContext.currentTime);
    filterNode.Q.setValueAtTime(5, this.offlineContext.currentTime);
    filterNode.connect(masterGainNode);

    const isAnyContinuousEvent = continuousData.some(cont => cont.data.amplitude.length > 0);

    discreteData.forEach(d => {
      this.createAudioNodesForDiscreteConfig(d, isAnyContinuousEvent ? filterNode : masterGainNode);
    });

    continuousData.forEach(d => {
      this.createAudioNodesForContinuousConfig(d, continuousDuration, filterNode);
    });

    this.renderedBuffer = await this.offlineContext.startRendering();
    return this.renderedBuffer;
  }

  private calculateTotalDuration(data: AudioPatternConfig): [number, number, number] {
    const amplitude = data.continuousData[0].data.amplitude;
    const continuousDuration = ((amplitude.length > 0 ? amplitude[amplitude.length - 1].time : 0) / 1000) + 0.01;

    let discreteDuration = 0;
    data.discreteData.forEach((event) => {
      if (event.oscillator && event.oscillator.envelope) {
        const eventStartTime = event.timestamp / 1000;
        const envelope = event.oscillator.envelope;
        const oscillatorDuration = envelope.attack + envelope.decay + envelope.sustain_duration + envelope.release;
        discreteDuration = Math.max(discreteDuration, eventStartTime + oscillatorDuration);
      }
    });
    discreteDuration += 0.1;

    const totalDuration = Math.floor(Math.max(continuousDuration, discreteDuration) * this.sampleRate);
    return [continuousDuration, discreteDuration, totalDuration];
  }

  private createAudioNodesForDiscreteConfig(discreteAudioConfig: DiscreteAudioConfig, targetNode: AudioNode) {
    const { oscillator, timestamp, volume } = discreteAudioConfig;
    const startTime = timestamp / 1000;
    const { envelope, waveform } = oscillator;

    const oscillatorNode = this.offlineContext!.createOscillator();
    oscillatorNode.type = waveform as OscillatorType;
    this.applyFrequencyConfiguration(oscillatorNode, startTime, oscillator);

    const gainNode = this.offlineContext!.createGain();
    this.applyEnvelope(gainNode, envelope, startTime, volume);

    oscillatorNode.connect(gainNode);
    gainNode.connect(targetNode);

    const duration = envelope.attack + envelope.decay + envelope.sustain_duration + envelope.release;
    oscillatorNode.start(startTime);
    oscillatorNode.stop(startTime + duration);
  }

  private applyFrequencyConfiguration(
    osc: OscillatorNode,
    startTime: number,
    oscillatorConfig: DiscreteAudioConfig['oscillator'],
  ) {
    const { initial, final, decay_time } = oscillatorConfig.frequency;
    const envelope = oscillatorConfig.envelope;

    if (decay_time > 0 && initial !== final) {
      const totalDuration = envelope.attack + envelope.decay + envelope.sustain_duration + envelope.release;
      const sweepDuration = Math.min(decay_time, totalDuration);

      osc.frequency.setValueAtTime(initial, startTime);

      if (final > 20) {
        osc.frequency.exponentialRampToValueAtTime(final, startTime + sweepDuration);
        if (sweepDuration < totalDuration) {
          osc.frequency.setValueAtTime(final, startTime + sweepDuration);
        }
      }
    } else {
      osc.frequency.value = initial;
    }
  }

  private applyEnvelope(
    gainNode: GainNode,
    envelope: DiscreteAudioConfig['oscillator']['envelope'],
    startTime: number,
    volume: number,
  ) {
    const { attack, decay, sustain_level, sustain_duration, release } = envelope;
    const gain = gainNode.gain;
    const peakGain = volume;
    const sustainGain = peakGain * sustain_level;

    let currentTime = startTime;
    gain.setValueAtTime(0, currentTime);
    currentTime += attack;
    gain.linearRampToValueAtTime(peakGain, currentTime);
    currentTime += decay;
    gain.linearRampToValueAtTime(sustainGain, currentTime);
    currentTime += sustain_duration;
    gain.setValueAtTime(sustainGain, currentTime);
    currentTime += release;
    gain.linearRampToValueAtTime(0, currentTime);
  }

  private createAudioNodesForContinuousConfig(continuousData: ContinuousAudioConfig, continuousDuration: number, filterNode: AudioNode) {
    if (continuousData.data.amplitude.length === 0 || continuousData.data.frequency.length === 0) {
      return;
    }

    function valueForTime(data: { time: number; value: number }[], time: number) {
      const timeMs = time * 1000;
      if (timeMs <= data[0].time) return data[0].value;
      if (timeMs >= data[data.length - 1].time) return data[data.length - 1].value;
      for (let i = 1; i < data.length; i++) {
        if (timeMs <= data[i].time) {
          const t0 = data[i - 1].time;
          const t1 = data[i].time;
          const ratio = (timeMs - t0) / (t1 - t0);
          return data[i - 1].value + (data[i].value - data[i - 1].value) * ratio;
        }
      }
      return 0;
    }

    const oscillatorNode = this.offlineContext!.createOscillator();
    oscillatorNode.type = continuousData.type as OscillatorType;

    const gainNode = this.offlineContext!.createGain();

    for (let i = 0; i <= continuousDuration; i += 0.01) {
      gainNode.gain.setValueAtTime(valueForTime(continuousData.data.amplitude, i), i);
      oscillatorNode.frequency.setValueAtTime(valueForTime(continuousData.data.frequency, i), i);
    }

    oscillatorNode.connect(gainNode);
    gainNode.connect(filterNode);

    oscillatorNode.start(0);
    oscillatorNode.stop(continuousDuration);
  }
}
