import type { PatternData } from './types';

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

export class AudioPatternUtility {
  audioContext: AudioContext | null;
  offlineContext: OfflineAudioContext | null;
  renderedBuffer: AudioBuffer | null;
  currentSource: AudioBufferSourceNode | null;
  sampleRate: number;
  isInitialized: boolean;
  currentConfig: any;

  constructor() {
    this.audioContext = null;
    this.offlineContext = null;
    this.renderedBuffer = null;
    this.currentSource = null;
    this.sampleRate = 44100;
    this.isInitialized = false;
  }

  public async parsePattern(chartData: PatternData) {
    this.renderedBuffer = null;
    await this.initAudioContext();
    await this.renderPattern({
      discreteData: this.generateDiscreteAudioConfig(chartData),
      continuousData: this.generateContinuousAudioConfig(chartData),
    });
  }

  public async play() {
    if (!this.renderedBuffer) {
      throw new Error('No audio buffer to play. Call render() first.');
    }

    this.stop();

    this.currentSource = this.audioContext.createBufferSource();
    this.currentSource.buffer = this.renderedBuffer;
    this.currentSource.connect(this.audioContext.destination);
    this.currentSource.start();

    return new Promise<void>((resolve) => {
      this.currentSource.onended = () => {
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

  public getBufferInfo() {
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
    if (!this.isInitialized) {
      const AudioContextConstructor =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextConstructor();
      this.isInitialized = true;
    }

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  private generateDiscreteAudioConfig(chartData: PatternData): DiscreteAudioConfig[] {
    const discreteData = [];

    function alignVolume(x: number, sources: number) {
      return 0.1 / sources + (0.9 / sources) * x;
    }

    const sources = 3; // number of oscillators per bar
    const maxFrequency = 440;
    const minFrequency = 60;

    function normalizeFrequency(value: number) {
      return minFrequency + (maxFrequency - minFrequency) * value;
    }

    for (const bar of chartData.discretePattern) {
      const baseFrequency = normalizeFrequency(bar.frequency);
      const targetFrequency = baseFrequency * 0.2;
      discreteData.push({
        oscillator: {
          frequency: { initial: baseFrequency, final: targetFrequency, decay_time: 0.028 },
          envelope: {
            attack: 0.002,
            decay: 0,
            sustain_level: 1,
            sustain_duration: 0,
            release: 0.014,
          },
          waveform: 'sine',
        },
        timestamp: bar.time * 1000,
        volume: alignVolume(bar.amplitude, sources),
      });

      const harmonic1 = baseFrequency * 1.5;
      const targetHarmonic1 = harmonic1 * 0.4;
      discreteData.push({
        oscillator: {
          frequency: { initial: harmonic1, final: targetHarmonic1, decay_time: 0.031 },
          envelope: {
            attack: 0,
            decay: 0,
            sustain_level: 1,
            sustain_duration: 0,
            release: 0.015,
          },
          waveform: 'sine',
        },
        timestamp: bar.time * 1000,
        volume: alignVolume(bar.amplitude, sources),
      });

      const harmonic2 = baseFrequency * 0.3;
      const targetHarmonic2 = harmonic2 * 0.5;
      discreteData.push({
        oscillator: {
          frequency: { initial: harmonic2, final: targetHarmonic2, decay_time: 0.039 },
          envelope: {
            attack: 0.005,
            decay: 0,
            sustain_level: 1,
            sustain_duration: 0,
            release: 0.018,
          },
          waveform: 'sine',
        },
        timestamp: bar.time * 1000,
        volume: alignVolume(bar.amplitude, sources),
      });
    }

    return discreteData;
  }

  private generateContinuousAudioConfig(chartData: PatternData): ContinuousAudioConfig[] {
    function normalizeFrequency(x: number) {
      return 80 + (230 - 80) * x;
    }

    function createComponentWave(
      amplitudeModifier: number,
      frequencyModifier: number,
      type: string = 'sine',
    ) {
      const line = {
        data: {
          amplitude: [],
          frequency: [],
        },
        type,
      };

      for (const amplitudePoint of chartData.continuousPattern.amplitude) {
        line.data.amplitude.push({
          time: amplitudePoint.time * 1000,
          value: amplitudePoint.value * amplitudeModifier,
        });
      }
      for (const frequencyPoint of chartData.continuousPattern.frequency) {
        line.data.frequency.push({
          time: frequencyPoint.time * 1000,
          value: normalizeFrequency(frequencyPoint.value) * frequencyModifier,
        });
      }

      return line;
    }

    const lines = [];
    lines.push(createComponentWave(0.6, 0.8, 'sine'));
    // lines.push(createContinuousWave(0.05, 1, 'square'));
    lines.push(createComponentWave(0.2, 0.4, 'triangle'));
    // lines.push(createContinuousWave(0.1, 0.5, 'sawtooth'));
    lines.push(createComponentWave(0.5, 1, 'sine'));

    return lines;
  }

  private async renderPattern(data: AudioPatternConfig) {
    const { discreteData, continuousData } = data;

    const [continuousDuration, _, totalDuration] = this.calculateTotalDuration(data);

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

    discreteData.forEach(data => {
      this.createAudioNodesForDiscreteConfig(data, isAnyContinuousEvent ? filterNode : masterGainNode);
    });

    continuousData.forEach(data => {
      this.createAudioNodesForContinuousConfig(data, continuousDuration, filterNode)
    })

    this.renderedBuffer = await this.offlineContext.startRendering();

    return this.renderedBuffer;
  }

  private calculateTotalDuration(data: AudioPatternConfig) {
    const amplitude = data.continuousData[0].data.amplitude;
    const continuousDuration = ((amplitude.length > 0 ? amplitude[amplitude.length - 1].time : 0) / 1000) + 0.01;

    let discreteDuration = 0;
    data.discreteData.forEach((event) => {
      if (event.oscillator && event.oscillator.envelope) {
        const eventStartTime = event.timestamp / 1000;
        const envelope = event.oscillator.envelope;
        const oscillatorDuration =
          envelope.attack + envelope.decay + envelope.sustain_duration + envelope.release;
        const eventEndTime = eventStartTime + oscillatorDuration;
        discreteDuration = Math.max(discreteDuration, eventEndTime);
      }
    });
    discreteDuration = discreteDuration + 0.1;

    const totalDuration = Math.floor(Math.max(continuousDuration, discreteDuration) * this.sampleRate);

    return [continuousDuration, discreteDuration, totalDuration];
  }

  private createAudioNodesForDiscreteConfig(
    discreteAudioConfig: DiscreteAudioConfig,
    targetNode: AudioNode,
  ) {
    const { oscillator, timestamp, volume } = discreteAudioConfig;

    const startTime = timestamp / 1000;
    const { envelope, waveform } = oscillator;

    const oscillatorNode = this.offlineContext.createOscillator();
    oscillatorNode.type = waveform as OscillatorType;
    this.applyFrequencyConfiguration(oscillatorNode, startTime, oscillator);

    const gainNode = this.offlineContext.createGain();
    this.applyEnvelope(gainNode, envelope, startTime, volume);

    oscillatorNode.connect(gainNode);
    gainNode.connect(targetNode);

    const duration =
      envelope.attack + envelope.decay + envelope.sustain_duration + envelope.release;
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
    const startFreq = initial;
    const endFreq = final;

    if (decay_time && decay_time > 0 && startFreq !== endFreq) {
      // Apply frequency sweep
      const totalDuration =
        envelope.attack + envelope.decay + envelope.sustain_duration + envelope.release;
      const sweepDuration = Math.min(decay_time, totalDuration);

      osc.frequency.setValueAtTime(startFreq, startTime);

      if (endFreq > 20) {
        // Ensure frequency doesn't go too low
        osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + sweepDuration);

        // Hold final frequency for remaining duration
        if (sweepDuration < totalDuration) {
          osc.frequency.setValueAtTime(endFreq, startTime + sweepDuration);
        }
      }
    } else {
      // Static frequency
      osc.frequency.value = startFreq;
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

    // Attack
    gain.setValueAtTime(0, currentTime);
    currentTime += attack;
    gain.linearRampToValueAtTime(peakGain, currentTime);

    // Decay
    currentTime += decay;
    gain.linearRampToValueAtTime(sustainGain, currentTime);

    // Sustain
    currentTime += sustain_duration;
    gain.setValueAtTime(sustainGain, currentTime);

    // Release
    currentTime += release;
    gain.linearRampToValueAtTime(0, currentTime);
  }

  private createAudioNodesForContinuousConfig(continuousData: ContinuousAudioConfig, continuousDuration: number, filterNode: AudioNode) {
    if (continuousData.data.amplitude.length == 0 || continuousData.data.frequency.length == 0) {
      return;
    }

    function valueForTime(continuousData: {time: number, value: number}[], time: number) {
      time *= 1000; // convert to ms
      if (time < continuousData[0].time) {
        return continuousData[0].value;
      }
      if (time > continuousData[continuousData.length - 1].time) {
        return continuousData[continuousData.length - 1].value;
      }
      for (let i = 1; i < continuousData.length; i += 1) {
        if (time == continuousData[i].time) {
          return continuousData[i].value;
        }
        if (time < continuousData[i].time) {
          const t0 = continuousData[i - 1].time;
          const t1 = continuousData[i].time;
          const v0 = continuousData[i - 1].value;
          const v1 = continuousData[i].value;
          const ratio = (time - t0) / (t1 - t0);
          return v0 + (v1 - v0) * ratio;
        }
      }
      return 0;
    }

    const oscillatorNode = this.offlineContext.createOscillator();
    oscillatorNode.type = continuousData.type as OscillatorType;

    const gainNode = this.offlineContext.createGain();

    for (let i = 0; i <= continuousDuration; i += 0.01) {
      const timestamp = i;
      gainNode.gain.setValueAtTime(valueForTime(continuousData.data.amplitude, timestamp), timestamp);
      oscillatorNode.frequency.setValueAtTime(valueForTime(continuousData.data.frequency, timestamp), timestamp);
    }

    oscillatorNode.connect(gainNode);
    gainNode.connect(filterNode);

    oscillatorNode.start(0);
    oscillatorNode.stop(continuousDuration);
  }
}
