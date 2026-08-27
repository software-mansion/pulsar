/**
 * The particle layer's public shape. Both backends — the TypeGPU/WebGPU one and
 * the Canvas 2D fallback — implement this, so the game never branches on which
 * is running.
 */

/** Kinds are numbered because the WebGPU backend passes them to a shader. */
export const BurstKind = {
  /** A shape vanishing: a tight puff of sparks in its own colour. */
  pop: 0,
  /** A wrapped shape or colour bomb: a heavy radial blast with smoke. */
  explosion: 1,
  /** The combo finale: rainbow rectangles that spin and flutter down. */
  confetti: 2,
  /** A striped shape's beam: particles fired along one axis. */
  streak: 3,
  /** A special being created: a small bright shimmer. */
  spark: 4,
} as const;

export type BurstKindValue = (typeof BurstKind)[keyof typeof BurstKind];

export type Burst = {
  kind: BurstKindValue;
  /** Canvas-space pixels, origin top-left. */
  x: number;
  y: number;
  /** Linear RGB, each channel 0..1. */
  color: readonly [number, number, number];
  count: number;
  /** 0..1 — scales speed, size and lifetime together. */
  energy: number;
  /** Unit vector; only `streak` uses it. */
  dirX?: number;
  dirY?: number;
};

export interface ParticleField {
  readonly backend: 'webgpu' | 'canvas';
  /** CSS pixel size of the canvas; the backend applies device-pixel scaling. */
  resize(width: number, height: number): void;
  /**
   * Where the board's top-left corner sits on the canvas.
   *
   * The canvas is deliberately larger than the board — it spans the whole app
   * shell — so sparks can leave the board and keep going instead of being
   * guillotined at its border. Callers still emit in *board* coordinates and
   * the backend shifts them, so nothing that describes an effect has to know
   * where the board happens to be sitting.
   */
  setOrigin(x: number, y: number): void;
  emit(burst: Burst): void;
  /** Simulates and draws one frame. `dt` is in seconds. */
  frame(dt: number): void;
  clear(): void;
  destroy(): void;
}

export const MAX_PARTICLES = 6144;
export const MAX_BURSTS = 64;

/**
 * How long a backend keeps accepting bursts after its last drawn frame.
 *
 * Browsers stop firing `requestAnimationFrame` for a hidden or throttled page,
 * so a game left running there keeps *emitting* bursts that nothing simulates
 * or draws; they then all arrive at once on the first frame back, as one absurd
 * wall of confetti. The fix is to ask the render loop whether it is actually
 * running rather than to ask `document.hidden` — embedded and preview surfaces
 * report themselves hidden while plainly on screen, and trusting that flag
 * silently deletes every effect in them.
 */
export const LOOP_STALE_MS = 250;

/**
 * The longest a particle can live, in milliseconds.
 *
 * Confetti is the slowest to die at 1.25s + up to 0.9s of jitter; every other
 * kind is well under that. Both backends use this to know when the pool has
 * certainly emptied so they can stop simulating and drawing — see the note on
 * idling in `gpu.ts`. It is an upper bound with margin, not a measurement: too
 * high only wastes a few frames, too low would cut particles off mid-flight.
 */
export const MAX_LIFETIME_MS = 2400;

/** How a caller sets up a field, and how a backend reports back. */
export type FieldOptions = {
  /**
   * Skip WebGPU and go straight to Canvas 2D. Set when rebuilding after a lost
   * device: the GPU has already proven unreliable on this page, and a canvas
   * that has handed out a `webgpu` context can never hand out a `2d` one, so
   * the retry needs both a fresh element and a reason not to try again.
   */
  forceCanvas?: boolean;
  /**
   * The backend died under the game — a lost GPU device, a driver reset, a
   * fatal out-of-memory. Fired at most once, and never for an ordinary
   * `destroy()`. The field is already inert; the caller is expected to drop it
   * and stand a new one up.
   */
  onLost?: (reason: string) => void;
};
