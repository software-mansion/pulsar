import tgpu from 'typegpu';
import * as d from 'typegpu/data';
import * as std from 'typegpu/std';
import {
  BurstKind,
  LOOP_STALE_MS,
  MAX_BURSTS,
  MAX_LIFETIME_MS,
  MAX_PARTICLES,
  type Burst,
  type FieldOptions,
  type ParticleField,
} from './types';

/**
 * The WebGPU particle field, written in TypeGPU.
 *
 * Both halves of the simulation live on the GPU. Spawning is a compute pass:
 * the CPU appends a *description* of each burst (origin, colour, kind, energy)
 * to a small storage array and dispatches one thread per particle to be born,
 * so a nine-tile cascade costs one buffer write and one dispatch rather than
 * thousands of JS object allocations. Integration is a second compute pass over
 * the whole pool, and drawing is a single instanced draw of `MAX_PARTICLES`
 * quads. Nothing about a burst ever round-trips back to JavaScript.
 *
 * The ring buffer that hands out particle slots is deliberately never allowed
 * to wrap *inside* a burst — when a burst would straddle the end of the pool,
 * the cursor resets to zero first. That costs a few prematurely recycled
 * particles and buys a shader with no modulo and no atomics.
 */

const Particle = d.struct({
  pos: d.vec2f,
  vel: d.vec2f,
  color: d.vec4f,
  life: d.f32,
  maxLife: d.f32,
  size: d.f32,
  spin: d.f32,
  /** Mirrors `BurstKind`, held as f32 so the shaders never mix numeric types. */
  kind: d.f32,
  drag: d.f32,
  gravity: d.f32,
  seed: d.f32,
});

const BurstData = d.struct({
  origin: d.vec2f,
  dir: d.vec2f,
  color: d.vec4f,
  first: d.u32,
  count: d.u32,
  kind: d.f32,
  energy: d.f32,
  seed: d.f32,
});

const Frame = d.struct({
  resolution: d.vec2f,
  dt: d.f32,
  time: d.f32,
});

const TAU = 6.2831855;

/** Cheap hash — plenty for scattering sparks, and stable across drivers. */
const rand = (seed: number) => {
  'use gpu';
  return std.fract(std.sin(seed * 12.9898) * 43758.547);
};

/** Rainbow ramp for confetti, so a finale is not one flat colour. */
const rainbow = (t: number) => {
  'use gpu';
  const r = 0.5 + 0.5 * std.cos(TAU * (t + 0.0));
  const g = 0.5 + 0.5 * std.cos(TAU * (t + 0.33));
  const b = 0.5 + 0.5 * std.cos(TAU * (t + 0.67));
  return d.vec3f(r, g, b);
};

/**
 * 1 when `value` falls inside [lo, hi), else 0 — a branch-free `kind ==` test.
 * The bounds are written as float literals on purpose: passing whole numbers
 * makes TypeGPU infer `i32` and emit an implicit-conversion warning on every
 * call.
 */
const inRange = (value: number, lo: number, hi: number) => {
  'use gpu';
  return std.step(lo, value) * (1 - std.step(hi, value));
};

export async function createGpuParticles(
  canvas: HTMLCanvasElement,
  options: FieldOptions = {},
): Promise<ParticleField> {
  // Device and shaders are brought up *before* the canvas context is claimed.
  // `getContext('webgpu')` is irreversible — once it succeeds the same element
  // can never hand out a 2D context — so anything that might fail (no adapter,
  // a shader that will not compile on this driver) has to fail while the
  // canvas is still untouched and the 2D fallback is still reachable.
  const root = await tgpu.init();
  const format = navigator.gpu.getPreferredCanvasFormat();

  const particleBuffer = root.createBuffer(d.arrayOf(Particle, MAX_PARTICLES)).$usage('storage');
  const particlesRW = particleBuffer.as('mutable');
  const particlesRO = particleBuffer.as('readonly');

  const burstBuffer = root.createBuffer(d.arrayOf(BurstData, MAX_BURSTS)).$usage('storage');
  const burstsRO = burstBuffer.as('readonly');

  const frameBuffer = root.createBuffer(Frame).$usage('uniform');
  const frame = frameBuffer.as('uniform');

  // ------------------------------------------------------------- spawn --

  const spawnPipeline = root.createGuardedComputePipeline(
    (slotInBurst: number, burstIndex: number) => {
      'use gpu';
      const burst = burstsRO.$[burstIndex];
      if (slotInBurst >= burst.count) {
        return;
      }

      const index = burst.first + slotInBurst;
      const n = d.f32(slotInBurst);
      const seed = burst.seed + n * 7.13;

      const r1 = rand(seed);
      const r2 = rand(seed + 11.7);
      const r3 = rand(seed + 23.9);
      const r4 = rand(seed + 37.1);

      const energy = burst.energy;
      const kind = burst.kind;
      const pop = inRange(kind, -0.5, 0.5);
      const explosion = inRange(kind, 0.5, 1.5);
      const confetti = inRange(kind, 1.5, 2.5);
      const streak = inRange(kind, 2.5, 3.5);
      const spark = inRange(kind, 3.5, 4.5);

      // Direction. Most kinds fly out radially; a streak is squeezed onto the
      // axis its beam travels, with only a little spread.
      const angle = r1 * TAU;
      const radial = d.vec2f(std.cos(angle), std.sin(angle));
      const spread = (r2 - 0.5) * 0.55;
      const beam = d.vec2f(burst.dir.x + burst.dir.y * spread, burst.dir.y - burst.dir.x * spread);
      const heading = std.mix(radial, beam, streak);

      // Speed, size and lifetime per kind, blended rather than branched.
      const speed =
        pop * (70 + r3 * 190) * (0.55 + energy) +
        explosion * (150 + r3 * 460) * (0.6 + energy) +
        confetti * (90 + r3 * 320) +
        streak * (420 + r3 * 520) * (0.6 + energy) +
        spark * (50 + r3 * 130);

      const size =
        pop * (2.6 + r4 * 4.2) +
        explosion * (4 + r4 * 9) +
        confetti * (5 + r4 * 5.5) +
        streak * (3 + r4 * 5) +
        spark * (2 + r4 * 3.4);

      const life =
        pop * (0.34 + r2 * 0.3) +
        explosion * (0.5 + r2 * 0.55) +
        confetti * (1.25 + r2 * 0.9) +
        streak * (0.28 + r2 * 0.3) +
        spark * (0.4 + r2 * 0.35);

      // Confetti hangs and flutters; sparks and beams are weightless and quick.
      const gravity = pop * 620 + explosion * 380 + confetti * 240 + streak * 0 + spark * 90;
      const drag = pop * 2.4 + explosion * 1.5 + confetti * 1.1 + streak * 3.4 + spark * 2.2;

      // Confetti takes a rainbow of its own; everything else keeps the shape's
      // colour, jittered slightly so a burst does not look like a flat decal.
      const tint = 0.78 + r4 * 0.44;
      const own = d.vec3f(burst.color.x * tint, burst.color.y * tint, burst.color.z * tint);
      const rgb = std.mix(own, rainbow(r1), confetti);

      const start = std.add(
        burst.origin,
        std.mul(radial, r4 * 9 * (1 - streak) + streak * n * 1.5),
      );

      // Storage writes take an explicit constructor: assigning a derived vector
      // straight across is a reference assignment, which WGSL forbids.
      particlesRW.$[index].pos = d.vec2f(start);
      particlesRW.$[index].vel = d.vec2f(std.mul(heading, speed));
      particlesRW.$[index].color = d.vec4f(rgb.x, rgb.y, rgb.z, burst.color.w);
      particlesRW.$[index].life = life;
      particlesRW.$[index].maxLife = life;
      particlesRW.$[index].size = size;
      particlesRW.$[index].spin = (r3 - 0.5) * 3.2 * (1 + confetti * 2.5);
      particlesRW.$[index].kind = kind;
      particlesRW.$[index].drag = drag;
      particlesRW.$[index].gravity = gravity;
      particlesRW.$[index].seed = r1 * 100;
    },
  );

  // ---------------------------------------------------------- integrate --

  const simulatePipeline = root.createGuardedComputePipeline((index: number) => {
    'use gpu';
    const p = particlesRW.$[index];
    if (p.life <= 0) {
      return;
    }

    const dt = frame.$.dt;
    const damping = std.max(0, 1 - p.drag * dt);

    // Confetti drifts side to side on the way down; nothing else wobbles.
    const flutter = inRange(p.kind, 1.5, 2.5) * std.sin(frame.$.time * 5.5 + p.seed) * 130 * dt;

    const vel = d.vec2f(p.vel.x * damping + flutter, p.vel.y * damping + p.gravity * dt);

    particlesRW.$[index].vel = d.vec2f(vel);
    particlesRW.$[index].pos = d.vec2f(std.add(p.pos, std.mul(vel, dt)));
    particlesRW.$[index].life = p.life - dt;
  });

  // ------------------------------------------------------------- render --

  const renderPipeline = root.createRenderPipeline({
    vertex: (input) => {
      'use gpu';
      const p = particlesRO.$[input.$instanceIndex];

      // Four vertices as a strip: (0,0) (1,0) (0,1) (1,1), derived with pure
      // float maths so the shader never leans on integer bit tricks.
      const v = d.f32(input.$vertexIndex);
      const corner = d.vec2f(std.fract(v * 0.5) * 4 - 1, std.floor(v * 0.5) * 2 - 1);

      const alive = std.step(0.00001, p.life);
      const age = 1 - p.life / std.max(p.maxLife, 0.00001);

      // Confetti is a flattened rectangle; everything else stays square.
      const confetti = inRange(p.kind, 1.5, 2.5);
      const shaped = d.vec2f(corner.x, corner.y * (1 - confetti * 0.58));

      const angle = p.spin * age * 5;
      const ca = std.cos(angle);
      const sa = std.sin(angle);
      const spun = d.vec2f(shaped.x * ca - shaped.y * sa, shaped.x * sa + shaped.y * ca);

      // Sparks swell as they are born and shrink as they die.
      const grow = std.smoothstep(0, 0.12, age) * (1 - std.smoothstep(0.55, 1, age) * 0.75);
      const world = std.add(p.pos, std.mul(spun, p.size * (0.35 + grow) * alive));

      const res = frame.$.resolution;
      return {
        $position: d.vec4f((world.x / res.x) * 2 - 1, 1 - (world.y / res.y) * 2, 0, 1),
        tint: p.color,
        uv: corner,
        age,
        shape: confetti,
        alive,
      };
    },

    fragment: (input) => {
      'use gpu';
      const dist = std.length(input.uv);

      // Round soft sprite, or a solid card for confetti.
      const disc = 1 - std.smoothstep(0.2, 1, dist);
      const mask = std.mix(disc, 1 - std.smoothstep(0.92, 1.02, dist), input.shape);

      const fade = 1 - std.smoothstep(0.45, 1, input.age);
      const alpha = std.clamp(input.tint.w * mask * fade * input.alive, 0, 1);

      // A hot core: the middle of a spark reads brighter than its colour.
      const glow = 1 + (1 - std.smoothstep(0, 0.7, dist)) * 1.1 * (1 - input.shape);
      const rgb = std.mul(d.vec3f(input.tint.x, input.tint.y, input.tint.z), alpha * glow);

      return d.vec4f(rgb.x, rgb.y, rgb.z, alpha);
    },

    primitive: { topology: 'triangle-strip' },
    targets: {
      format,
      blend: {
        // Premultiplied source, so `glow` above can push a sprite past its own
        // alpha and read as light without blowing out the pale board behind it.
        color: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' },
        alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' },
      },
    },
  });

  // --------------------------------------------------------------- host --

  try {
    // Compiles all three shaders. A driver-specific WGSL failure surfaces here,
    // where the caller can still drop to Canvas 2D.
    await Promise.all([
      spawnPipeline.initAsync(),
      simulatePipeline.initAsync(),
      renderPipeline.initAsync(),
    ]);
  } catch (error) {
    root.destroy();
    throw error;
  }

  const context = canvas.getContext('webgpu');
  if (!context) {
    root.destroy();
    throw new Error('WebGPU context unavailable');
  }
  context.configure({ device: root.device, format, alphaMode: 'premultiplied' });

  // 0 means "never sized" — see the note on the same fields in `canvas.ts`.
  let width = 0;
  let height = 0;
  let cursor = 0;
  let elapsed = 0;
  /** Inert: stops accepting and drawing. Set by a loss as well as a teardown. */
  let destroyed = false;
  /** Torn down: the GPU resources have been handed back. Only `destroy()` sets it. */
  let released = false;
  /** Seeded so bursts emitted before the very first frame are still accepted. */
  let lastFrameAt = performance.now();
  /**
   * When the pool is guaranteed empty again.
   *
   * The game is idle most of the time — a player thinking about their next swap
   * is several seconds of nothing to draw. Dispatching a 6144-thread compute
   * pass and a full-screen render pass at 60fps through all of that keeps a
   * phone's GPU at load for no picture at all, which is what heats a device up
   * and, on a memory-tight one, is what eventually costs us the device
   * altogether. Bursts are the only thing that create work, so `emit` pushes
   * this out and `frame` skips both passes once it has gone by.
   */
  let busyUntil = 0;
  let originX = 0;
  let originY = 0;
  const pending: Burst[] = [];

  const field: ParticleField = {
    backend: 'webgpu',

    resize(nextWidth, nextHeight) {
      // Called from the frame loop, so this must be free when nothing changed:
      // assigning `canvas.width` reallocates the backing store and wipes the
      // canvas, which at 60fps would erase the particles it is meant to show.
      const w = Math.max(1, nextWidth);
      const h = Math.max(1, nextHeight);
      if (w === width && h === height) return;

      width = w;
      height = h;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    },

    setOrigin(x, y) {
      originX = x;
      originY = y;
    },

    emit(burst) {
      if (destroyed || pending.length >= MAX_BURSTS) return;
      // Nothing is drawing, so nothing would be seen — and banking these is
      // what produces the wall of confetti on the first frame back.
      if (performance.now() - lastFrameAt > LOOP_STALE_MS) return;
      // Shifted here rather than at the call site: effects are written in board
      // coordinates and should stay that way.
      pending.push({ ...burst, x: burst.x + originX, y: burst.y + originY });
      busyUntil = performance.now() + MAX_LIFETIME_MS;
    },

    frame(dt) {
      if (destroyed) return;
      lastFrameAt = performance.now();
      elapsed += dt;

      // Nothing alive and nothing queued: the last drawn frame was already
      // empty, so leave it on screen rather than clearing it again. See
      // `busyUntil`.
      if (pending.length === 0 && lastFrameAt > busyUntil) return;

      frameBuffer.write({ resolution: d.vec2f(width, height), dt, time: elapsed });

      if (pending.length > 0) {
        let widest = 0;
        const packed = pending.map((burst) => {
          const count = Math.min(burst.count, MAX_PARTICLES);
          // Never let one burst straddle the end of the ring.
          if (cursor + count > MAX_PARTICLES) cursor = 0;
          const first = cursor;
          cursor += count;
          widest = Math.max(widest, count);

          return {
            origin: d.vec2f(burst.x, burst.y),
            dir: d.vec2f(burst.dirX ?? 0, burst.dirY ?? -1),
            color: d.vec4f(burst.color[0], burst.color[1], burst.color[2], 1),
            first,
            count,
            kind: burst.kind,
            energy: burst.energy,
            seed: Math.random() * 500,
          };
        });

        burstBuffer.write(packed, { startOffset: 0 });
        spawnPipeline.dispatchThreads(widest, packed.length);
        pending.length = 0;
      }

      simulatePipeline.dispatchThreads(MAX_PARTICLES);

      renderPipeline
        .withColorAttachment({
          view: context,
          clearValue: [0, 0, 0, 0],
          loadOp: 'clear',
          storeOp: 'store',
        })
        .draw(4, MAX_PARTICLES);
    },

    clear() {
      if (destroyed) return;
      pending.length = 0;
      cursor = 0;
      particleBuffer.clear();
    },

    destroy() {
      if (released) return;
      released = true;
      destroyed = true;
      pending.length = 0;
      root.destroy();
    },
  };

  /**
   * Losing the GPU out from under the game.
   *
   * A phone takes its device away for reasons the page never sees: memory
   * pressure, the browser going to the background, a driver reset. What is left
   * behind is the worst possible thing to leave behind — this canvas is
   * stretched over the entire app shell at `z-index: 20`, so a context that has
   * stopped presenting is a sheet of nothing covering the board, the HUD and
   * the tab bar, while `pointer-events: none` lets every touch through to a
   * game that is still running perfectly well underneath it. That is the white
   * screen you can still play blind.
   *
   * So a loss is reported rather than swallowed: the field goes inert and the
   * caller throws this canvas away and stands a fresh one up on Canvas 2D.
   */
  const reportLost = (reason: string) => {
    // `released` rather than `destroyed`: a field that has gone inert on its
    // own still owns its buffers, and the caller's teardown has to be able to
    // hand them back.
    if (released || destroyed) return;
    destroyed = true;
    pending.length = 0;
    options.onLost?.(reason);
  };

  // Tearing the root down ourselves resolves this promise too, which `released`
  // is what distinguishes from a device that went away on its own.
  void root.device.lost.then((info) => reportLost(info.message || 'GPU device lost'));

  // Out of memory is fatal in the same way but arrives on a different channel,
  // and is the likeliest of the two on a phone. Validation errors are the
  // game's own bugs and must stay loud rather than silently downgrading it.
  root.device.addEventListener('uncapturederror', (event) => {
    const error = (event as GPUUncapturedErrorEvent).error;
    if (typeof GPUOutOfMemoryError !== 'undefined' && error instanceof GPUOutOfMemoryError) {
      reportLost(`GPU out of memory: ${error.message}`);
      return;
    }
    console.error('[shape] WebGPU error:', error);
  });

  field.resize(canvas.clientWidth || 1, canvas.clientHeight || 1);
  particleBuffer.clear();
  return field;
}

export { BurstKind };
