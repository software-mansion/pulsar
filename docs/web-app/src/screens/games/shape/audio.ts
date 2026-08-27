import { isSoundEnabled } from '../../../haptics';

/**
 * Every sound in the game is synthesised on the spot — there are no samples to
 * download, license or keep in sync with the repo.
 *
 * That is not only a packaging convenience. Because the voices are generated,
 * they can be driven by the *same* numbers as the haptics: a match's tile count
 * picks the pitch as well as the pulse width, and the finale's riser is built
 * against `FINALE_MS`, the constant the finale haptic uses. Sound and vibration
 * therefore rise and land together instead of merely happening at once.
 *
 * Everything is consonant by construction: pitches are chosen from a C major
 * pentatonic scale, so a nine-deep cascade climbing the scale still sounds like
 * music rather than an alarm.
 */

/** C major pentatonic, in semitones — no interval in here can clash. */
const PENTATONIC = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26, 28];
const BASE_HZ = 523.25; // C5

const step = (degree: number) =>
  BASE_HZ * 2 ** ((PENTATONIC[Math.min(degree, PENTATONIC.length - 1)] ?? 0) / 12);

class GameAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;

  /**
   * Browsers refuse to start an AudioContext outside a user gesture, so the
   * board calls this from its first pointerdown. Safe to call repeatedly.
   */
  unlock() {
    const ctx = this.context();
    if (ctx && ctx.state === 'suspended') void ctx.resume();
  }

  close() {
    void this.ctx?.close();
    this.ctx = null;
    this.master = null;
    this.noise = null;
  }

  private context(): AudioContext | null {
    if (this.ctx) return this.ctx;
    const Ctor =
      window.AudioContext ??
      (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;

    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = 0.5;

    // A dozen voices can land inside one cascade frame; without this the sum
    // clips into a crackle rather than getting louder.
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -14;
    limiter.ratio.value = 12;
    limiter.attack.value = 0.002;
    limiter.release.value = 0.15;

    master.connect(limiter).connect(ctx.destination);
    this.ctx = ctx;
    this.master = master;
    return ctx;
  }

  /** Null whenever audio is unavailable or the user muted the app. */
  private live(): { ctx: AudioContext; out: GainNode; t: number } | null {
    if (!isSoundEnabled()) return null;
    const ctx = this.context();
    if (!ctx || !this.master) return null;
    if (ctx.state === 'suspended') void ctx.resume();
    return { ctx, out: this.master, t: ctx.currentTime };
  }

  private noiseBuffer(ctx: AudioContext): AudioBuffer {
    if (this.noise) return this.noise;
    const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    this.noise = buffer;
    return buffer;
  }

  // ------------------------------------------------------------- voices --

  /** A plucked tone with an exponential tail — the workhorse "blip". */
  private tone(
    at: number,
    opts: {
      freq: number;
      to?: number;
      duration: number;
      gain: number;
      type?: OscillatorType;
      delay?: number;
    },
  ) {
    const live = this.live();
    if (!live) return;
    const { ctx, out } = live;
    const start = at + (opts.delay ?? 0);

    const osc = ctx.createOscillator();
    osc.type = opts.type ?? 'triangle';
    osc.frequency.setValueAtTime(opts.freq, start);
    if (opts.to !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, opts.to), start + opts.duration);
    }

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, start);
    env.gain.exponentialRampToValueAtTime(opts.gain, start + 0.006);
    env.gain.exponentialRampToValueAtTime(0.0001, start + opts.duration);

    osc.connect(env).connect(out);
    osc.start(start);
    osc.stop(start + opts.duration + 0.02);
  }

  /** Filtered noise — the body of whooshes, blasts and landings. */
  private burst(
    at: number,
    opts: {
      duration: number;
      gain: number;
      from: number;
      to?: number;
      q?: number;
      type?: BiquadFilterType;
      delay?: number;
    },
  ) {
    const live = this.live();
    if (!live) return;
    const { ctx, out } = live;
    const start = at + (opts.delay ?? 0);

    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer(ctx);
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = opts.type ?? 'bandpass';
    filter.frequency.setValueAtTime(opts.from, start);
    if (opts.to !== undefined) {
      filter.frequency.exponentialRampToValueAtTime(Math.max(40, opts.to), start + opts.duration);
    }
    filter.Q.value = opts.q ?? 1.2;

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, start);
    env.gain.exponentialRampToValueAtTime(opts.gain, start + 0.008);
    env.gain.exponentialRampToValueAtTime(0.0001, start + opts.duration);

    src.connect(filter).connect(env).connect(out);
    src.start(start);
    src.stop(start + opts.duration + 0.02);
  }

  private now(): number | null {
    return this.live()?.t ?? null;
  }

  // -------------------------------------------------------------- events --

  select() {
    const t = this.now();
    if (t === null) return;
    this.tone(t, { freq: step(4), duration: 0.06, gain: 0.1, type: 'sine' });
  }

  swap() {
    const t = this.now();
    if (t === null) return;
    this.burst(t, { duration: 0.14, gain: 0.11, from: 900, to: 2600, q: 0.9 });
    this.tone(t, { freq: step(2), to: step(5), duration: 0.11, gain: 0.09, type: 'sine' });
  }

  reject() {
    const t = this.now();
    if (t === null) return;
    this.tone(t, { freq: 190, to: 130, duration: 0.13, gain: 0.16, type: 'square' });
    this.tone(t, { freq: 150, to: 96, duration: 0.16, gain: 0.16, type: 'square', delay: 0.11 });
  }

  /**
   * The shape pop. Cascade level walks up the pentatonic scale, so a chain
   * reaction plays as a rising phrase — the audible twin of the haptic climb.
   */
  match(tiles: number, cascade: number) {
    const t = this.now();
    if (t === null) return;
    const degree = Math.min(PENTATONIC.length - 1, cascade - 1 + Math.max(0, tiles - 3));
    const freq = step(degree);

    this.tone(t, { freq, to: freq * 1.9, duration: 0.16, gain: 0.16 });
    this.tone(t, { freq: freq * 2, duration: 0.1, gain: 0.06, type: 'sine', delay: 0.01 });
    this.burst(t, { duration: 0.07, gain: 0.09, from: 1800, to: 700, q: 0.8 });
  }

  /** Shapes hitting the bottom: a handful of dry wood-block clicks. */
  land(tiles: number, distance: number) {
    const t = this.now();
    if (t === null) return;
    const hits = Math.min(5, Math.max(2, Math.round(tiles / 5)));
    for (let i = 0; i < hits; i++) {
      const delay = (i / hits) * Math.min(0.3, 0.07 + distance * 0.03) + Math.random() * 0.02;
      this.burst(t, { duration: 0.05, gain: 0.07, from: 420 + Math.random() * 260, q: 3, delay });
    }
  }

  /** A striped shape's beam crossing the board. */
  sweep() {
    const t = this.now();
    if (t === null) return;
    this.burst(t, { duration: 0.26, gain: 0.15, from: 500, to: 5200, q: 1.6 });
    this.tone(t, { freq: step(3), to: step(9), duration: 0.24, gain: 0.09, type: 'sawtooth' });
  }

  /** Wrapped and colour-bomb detonations — `power` 0..1 sets the weight. */
  blast(power: number) {
    const t = this.now();
    if (t === null) return;
    this.burst(t, {
      duration: 0.34 + power * 0.3,
      gain: 0.2,
      from: 1600,
      to: 120,
      q: 0.7,
      type: 'lowpass',
    });
    this.tone(t, { freq: 150, to: 40, duration: 0.4 + power * 0.25, gain: 0.24, type: 'sine' });
    this.tone(t, { freq: 90, to: 32, duration: 0.5, gain: 0.14, type: 'triangle', delay: 0.02 });
  }

  /** A special shape being created — a bright upward arpeggio. */
  born(steps: number) {
    const t = this.now();
    if (t === null) return;
    for (let i = 0; i < steps; i++) {
      this.tone(t, { freq: step(4 + i * 2), duration: 0.12, gain: 0.1, delay: i * 0.05 });
    }
  }

  /**
   * The finale. Built against the same millisecond budget as the finale haptic
   * (`FINALE_MS`): riser, hit, then a shower of bells under the confetti.
   */
  finale(level: number, totalMs: number) {
    const t = this.now();
    if (t === null) return;
    const total = totalMs / 1000;
    const hit = total * 0.53;
    const power = Math.min(1, (level - 2) / 5);

    // Riser — noise climbing into the hit.
    this.burst(t, { duration: hit, gain: 0.14, from: 300, to: 6000, q: 1.1 });
    this.tone(t, { freq: step(0), to: step(7), duration: hit, gain: 0.07, type: 'sawtooth' });

    // The hit itself.
    this.blast(power);
    const chordAt = hit;
    [0, 2, 4, 7].forEach((offset, i) => {
      this.tone(t, {
        freq: step(offset),
        duration: 0.5,
        gain: 0.11,
        type: 'triangle',
        delay: chordAt + i * 0.012,
      });
    });

    // Confetti sparkle, thinning out exactly as the haptic's ticks do.
    const tail = total - hit - 0.08;
    for (let i = 0; i < 14; i++) {
      const progress = i / 14;
      this.tone(t, {
        freq: step(6 + Math.floor(Math.random() * 6)),
        duration: 0.22,
        gain: 0.075 * (1 - progress * 0.75),
        type: 'sine',
        delay: chordAt + 0.1 + progress * tail + Math.random() * 0.03,
      });
    }
  }

  shuffle() {
    const t = this.now();
    if (t === null) return;
    for (let i = 0; i < 8; i++) {
      this.burst(t, {
        duration: 0.07,
        gain: 0.06,
        from: 700 + Math.random() * 1400,
        q: 2.5,
        delay: i * 0.045,
      });
    }
  }
}

export const gameAudio = new GameAudio();
