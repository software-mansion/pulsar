// Renders a Pulsar haptic preset to a WebAudio buffer and plays it.
// Plain-JS port of figma/src/ui/audio/AudioPatternUtility.ts so the standalone
// preview app can run with no build step. Keep the two in sync.

export class AudioPatternUtility {
  constructor() {
    this.audioContext = null;
    this.offlineContext = null;
    this.renderedBuffer = null;
    this.currentSource = null;
    this.sampleRate = 44100;
    this.isInitialized = false;
  }

  async parsePattern(chartData) {
    this.renderedBuffer = null;
    await this.initAudioContext();
    await this.renderPattern({
      discreteData: this.generateDiscreteAudioConfig(chartData),
      continuousData: this.generateContinuousAudioConfig(chartData)
    });
  }

  async play() {
    if (!this.renderedBuffer || !this.audioContext) {
      throw new Error('No audio buffer to play. Call parsePattern() first.');
    }
    this.stop();
    this.currentSource = this.audioContext.createBufferSource();
    this.currentSource.buffer = this.renderedBuffer;
    this.currentSource.connect(this.audioContext.destination);
    this.currentSource.start();
    return new Promise((resolve) => {
      this.currentSource.onended = () => {
        this.currentSource = null;
        resolve();
      };
    });
  }

  stop() {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch {}
      this.currentSource = null;
    }
  }

  isPlaying() {
    return this.currentSource !== null;
  }

  async initAudioContext() {
    if (!this.isInitialized) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new Ctor();
      this.isInitialized = true;
    }
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  generateDiscreteAudioConfig(chartData) {
    const out = [];
    const sources = 3;
    const minF = 60;
    const maxF = 440;
    const alignVolume = (x) => 0.1 / sources + (0.9 / sources) * x;
    const norm = (v) => minF + (maxF - minF) * v;

    for (const bar of chartData.discretePattern) {
      const base = norm(bar.frequency);
      out.push({
        oscillator: {
          frequency: { initial: base, final: base * 0.2, decay_time: 0.028 },
          envelope: { attack: 0.002, decay: 0, sustain_level: 1, sustain_duration: 0, release: 0.014 },
          waveform: 'sine'
        },
        timestamp: bar.time,
        volume: alignVolume(bar.amplitude)
      });
      const h1 = base * 1.5;
      out.push({
        oscillator: {
          frequency: { initial: h1, final: h1 * 0.4, decay_time: 0.031 },
          envelope: { attack: 0, decay: 0, sustain_level: 1, sustain_duration: 0, release: 0.015 },
          waveform: 'sine'
        },
        timestamp: bar.time,
        volume: alignVolume(bar.amplitude)
      });
      const h2 = base * 0.3;
      out.push({
        oscillator: {
          frequency: { initial: h2, final: h2 * 0.5, decay_time: 0.039 },
          envelope: { attack: 0.005, decay: 0, sustain_level: 1, sustain_duration: 0, release: 0.018 },
          waveform: 'sine'
        },
        timestamp: bar.time,
        volume: alignVolume(bar.amplitude)
      });
    }
    return out;
  }

  generateContinuousAudioConfig(chartData) {
    const norm = (x) => 80 + (230 - 80) * x;
    const make = (ampMod, freqMod, type) => ({
      type,
      data: {
        amplitude: chartData.continuousPattern.amplitude.map((p) => ({
          time: p.time,
          value: p.value * ampMod
        })),
        frequency: chartData.continuousPattern.frequency.map((p) => ({
          time: p.time,
          value: norm(p.value) * freqMod
        }))
      }
    });
    return [make(0.6, 0.8, 'sine'), make(0.2, 0.4, 'triangle'), make(0.5, 1, 'sine')];
  }

  async renderPattern(data) {
    const [continuousDuration, , totalDuration] = this.calculateTotalDuration(data);
    this.offlineContext = new OfflineAudioContext(1, totalDuration, this.sampleRate);
    const ctx = this.offlineContext;

    const master = ctx.createGain();
    master.gain.value = 1.0;
    master.connect(ctx.destination);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(700, ctx.currentTime);
    filter.Q.setValueAtTime(5, ctx.currentTime);
    filter.connect(master);

    const hasContinuous = data.continuousData.some((c) => c.data.amplitude.length > 0);
    data.discreteData.forEach((d) => this.makeDiscrete(d, hasContinuous ? filter : master));
    data.continuousData.forEach((c) => this.makeContinuous(c, continuousDuration, filter));

    this.renderedBuffer = await ctx.startRendering();
    return this.renderedBuffer;
  }

  calculateTotalDuration(data) {
    const amp = data.continuousData[0]?.data.amplitude ?? [];
    const continuousDuration = (amp.length > 0 ? amp[amp.length - 1].time : 0) / 1000 + 0.01;
    let discreteDuration = 0;
    for (const e of data.discreteData) {
      const env = e.oscillator.envelope;
      const dur = env.attack + env.decay + env.sustain_duration + env.release;
      discreteDuration = Math.max(discreteDuration, e.timestamp / 1000 + dur);
    }
    discreteDuration += 0.1;
    const total = Math.floor(Math.max(continuousDuration, discreteDuration, 0.05) * this.sampleRate);
    return [continuousDuration, discreteDuration, total];
  }

  makeDiscrete(c, target) {
    const ctx = this.offlineContext;
    const { oscillator, timestamp, volume } = c;
    const start = timestamp / 1000;
    const env = oscillator.envelope;

    const osc = ctx.createOscillator();
    osc.type = oscillator.waveform;

    const { initial, final, decay_time } = oscillator.frequency;
    if (decay_time > 0 && initial !== final) {
      const totalDur = env.attack + env.decay + env.sustain_duration + env.release;
      const sweep = Math.min(decay_time, totalDur);
      osc.frequency.setValueAtTime(initial, start);
      if (final > 20) {
        osc.frequency.exponentialRampToValueAtTime(final, start + sweep);
        if (sweep < totalDur) osc.frequency.setValueAtTime(final, start + sweep);
      }
    } else {
      osc.frequency.value = initial;
    }

    const gain = ctx.createGain();
    const peak = volume;
    const sus = peak * env.sustain_level;
    let t = start;
    gain.gain.setValueAtTime(0, t);
    t += env.attack;
    gain.gain.linearRampToValueAtTime(peak, t);
    t += env.decay;
    gain.gain.linearRampToValueAtTime(sus, t);
    t += env.sustain_duration;
    gain.gain.setValueAtTime(sus, t);
    t += env.release;
    gain.gain.linearRampToValueAtTime(0, t);

    osc.connect(gain);
    gain.connect(target);
    const dur = env.attack + env.decay + env.sustain_duration + env.release;
    osc.start(start);
    osc.stop(start + dur);
  }

  makeContinuous(c, duration, target) {
    if (c.data.amplitude.length === 0 || c.data.frequency.length === 0) return;
    const ctx = this.offlineContext;

    const valueAt = (arr, time) => {
      time *= 1000;
      if (time < arr[0].time) return arr[0].value;
      if (time > arr[arr.length - 1].time) return arr[arr.length - 1].value;
      for (let i = 1; i < arr.length; i++) {
        if (time === arr[i].time) return arr[i].value;
        if (time < arr[i].time) {
          const t0 = arr[i - 1].time;
          const t1 = arr[i].time;
          const v0 = arr[i - 1].value;
          const v1 = arr[i].value;
          return v0 + (v1 - v0) * ((time - t0) / (t1 - t0));
        }
      }
      return 0;
    };

    const osc = ctx.createOscillator();
    osc.type = c.type;
    const gain = ctx.createGain();

    for (let i = 0; i <= duration; i += 0.01) {
      gain.gain.setValueAtTime(valueAt(c.data.amplitude, i), i);
      osc.frequency.setValueAtTime(valueAt(c.data.frequency, i), i);
    }
    osc.connect(gain);
    gain.connect(target);
    osc.start(0);
    osc.stop(duration);
  }
}

// Convenience: parse + play a preset by its data, caching the rendered buffer.
const cache = new Map();
export async function playPreset(id, data) {
  let util = cache.get(id);
  if (!util) {
    util = new AudioPatternUtility();
    await util.parsePattern(data);
    cache.set(id, util);
  }
  await util.play();
}

export function stopAll() {
  for (const u of cache.values()) u.stop();
}
