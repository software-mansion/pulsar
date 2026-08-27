import { BurstKind, LOOP_STALE_MS, MAX_PARTICLES, type Burst, type ParticleField } from './types';

/**
 * Canvas 2D stand-in for browsers without WebGPU (Safari before 26, Firefox
 * without the flag). It follows the same rules as the shader — same speeds,
 * lifetimes, gravity and flutter — so the game looks like itself everywhere,
 * just with a smaller pool and no additive glow.
 */

type P = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  spin: number;
  angle: number;
  kind: number;
  drag: number;
  gravity: number;
  seed: number;
  /** CSS colour, used for the flat confetti cards. */
  color: string;
  /** Pre-rendered glow for round kinds; null for confetti, which is flat. */
  sprite: HTMLCanvasElement | null;
};

/** Half the GPU pool: 2D fill calls, not vertices, are the limit here. */
const POOL = Math.min(1200, MAX_PARTICLES);

/**
 * Channels for a burst colour at a given tint, quantised.
 *
 * Rounding to 16 keeps the glow-sprite cache to a few dozen entries instead of
 * one per particle — the tint is random, so the exact value is not worth a
 * cache miss and a fresh gradient.
 */
const channels = (color: readonly [number, number, number], tint: number) =>
  color.map((c) => Math.min(240, Math.round((c * 255 * tint) / 16) * 16)) as [
    number,
    number,
    number,
  ];

const cssOf = ([r, g, b]: [number, number, number]) => `rgb(${r} ${g} ${b})`;

/**
 * Glow sprites, drawn once per colour and blitted thereafter.
 *
 * The GPU path gets its glow from the fragment shader — a soft radial falloff
 * plus a core boosted past its own alpha, so the middle of a spark reads as
 * light rather than paint. A flat `arc()` fill has neither, which is why the
 * fallback used to render plain circles. This bakes the same profile into a
 * bitmap: `drawImage` per particle is cheap, whereas building a gradient per
 * particle per frame is not.
 *
 * The outer stop repeats the particle's own colour at zero alpha rather than
 * using `transparent`, which interpolates towards black and rings every spark
 * with a dark halo.
 */
const SPRITE_PX = 64;
const glowCache = new Map<string, HTMLCanvasElement>();

function glowSprite([r, g, b]: [number, number, number]): HTMLCanvasElement | null {
  const key = `${r},${g},${b}`;
  const cached = glowCache.get(key);
  if (cached) return cached;

  const sprite = document.createElement('canvas');
  sprite.width = SPRITE_PX;
  sprite.height = SPRITE_PX;
  const paint = sprite.getContext('2d');
  if (!paint) return null;

  const mid = SPRITE_PX / 2;
  const gradient = paint.createRadialGradient(mid, mid, 0, mid, mid, mid);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  gradient.addColorStop(0.22, `rgba(${r}, ${g}, ${b}, 0.95)`);
  gradient.addColorStop(0.55, `rgba(${r}, ${g}, ${b}, 0.45)`);
  gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
  paint.fillStyle = gradient;
  paint.fillRect(0, 0, SPRITE_PX, SPRITE_PX);

  glowCache.set(key, sprite);
  return sprite;
}

const rainbow = (t: number) =>
  `hsl(${Math.round(t * 360)} 90% ${58 + Math.round(Math.random() * 12)}%)`;

export function createCanvasParticles(canvas: HTMLCanvasElement): ParticleField {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D context unavailable');

  const pool: P[] = Array.from({ length: POOL }, () => ({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    life: 0,
    maxLife: 1,
    size: 0,
    spin: 0,
    angle: 0,
    kind: 0,
    drag: 0,
    gravity: 0,
    seed: 0,
    color: '#fff',
    sprite: null,
  }));

  let cursor = 0;
  /**
   * 0 means "never sized". These must not be seeded from `canvas.clientWidth`:
   * the canvas is stretched over the whole shell, so that is already the size
   * the frame loop passes in, and the equality guard in `resize` would treat
   * the very first call as a no-op — leaving the backing store at its 300x150
   * default and every spark drawn into a thumbnail stretched over the app.
   */
  let width = 0;
  let height = 0;
  let dpr = 1;
  let elapsed = 0;
  let destroyed = false;
  /** Seeded so bursts emitted before the very first frame are still accepted. */
  let lastFrameAt = performance.now();
  let originX = 0;
  let originY = 0;

  function spawn(burst: Burst) {
    const count = Math.min(burst.count, POOL);
    for (let i = 0; i < count; i++) {
      const p = pool[cursor];
      cursor = (cursor + 1) % POOL;

      const angle = Math.random() * Math.PI * 2;
      const spread = (Math.random() - 0.5) * 0.55;
      const dirX = burst.dirX ?? 0;
      const dirY = burst.dirY ?? -1;
      const streak = burst.kind === BurstKind.streak;

      const hx = streak ? dirX + dirY * spread : Math.cos(angle);
      const hy = streak ? dirY - dirX * spread : Math.sin(angle);
      const r = Math.random();

      const speed =
        burst.kind === BurstKind.pop
          ? (70 + r * 190) * (0.55 + burst.energy)
          : burst.kind === BurstKind.explosion
            ? (150 + r * 460) * (0.6 + burst.energy)
            : burst.kind === BurstKind.confetti
              ? 90 + r * 320
              : streak
                ? (420 + r * 520) * (0.6 + burst.energy)
                : 50 + r * 130;

      p.size =
        burst.kind === BurstKind.pop
          ? 2.6 + Math.random() * 4.2
          : burst.kind === BurstKind.explosion
            ? 4 + Math.random() * 9
            : burst.kind === BurstKind.confetti
              ? 5 + Math.random() * 5.5
              : streak
                ? 3 + Math.random() * 5
                : 2 + Math.random() * 3.4;

      p.maxLife =
        burst.kind === BurstKind.pop
          ? 0.34 + Math.random() * 0.3
          : burst.kind === BurstKind.explosion
            ? 0.5 + Math.random() * 0.55
            : burst.kind === BurstKind.confetti
              ? 1.25 + Math.random() * 0.9
              : streak
                ? 0.28 + Math.random() * 0.3
                : 0.4 + Math.random() * 0.35;

      p.gravity =
        burst.kind === BurstKind.pop
          ? 620
          : burst.kind === BurstKind.explosion
            ? 380
            : burst.kind === BurstKind.confetti
              ? 240
              : streak
                ? 0
                : 90;

      p.drag =
        burst.kind === BurstKind.pop
          ? 2.4
          : burst.kind === BurstKind.explosion
            ? 1.5
            : burst.kind === BurstKind.confetti
              ? 1.1
              : streak
                ? 3.4
                : 2.2;

      p.x = burst.x + Math.cos(angle) * (streak ? i * 1.5 : Math.random() * 9);
      p.y = burst.y + Math.sin(angle) * (streak ? 0 : Math.random() * 9);
      p.vx = hx * speed;
      p.vy = hy * speed;
      p.life = p.maxLife;
      p.kind = burst.kind;
      p.spin = (Math.random() - 0.5) * 3.2 * (burst.kind === BurstKind.confetti ? 3.5 : 1);
      p.angle = Math.random() * Math.PI * 2;
      p.seed = Math.random() * 100;
      if (burst.kind === BurstKind.confetti) {
        p.color = rainbow(Math.random());
        p.sprite = null;
      } else {
        const tinted = channels(burst.color, 0.78 + Math.random() * 0.44);
        p.color = cssOf(tinted);
        p.sprite = glowSprite(tinted);
      }
    }
  }

  const field: ParticleField = {
    backend: 'canvas',

    resize(nextWidth, nextHeight) {
      // Called from the frame loop, so this must be free when nothing changed:
      // assigning `canvas.width` reallocates the backing store and wipes the
      // canvas, which at 60fps would erase the particles it is meant to show.
      const w = Math.max(1, nextWidth);
      const h = Math.max(1, nextHeight);
      if (w === width && h === height) return;

      width = w;
      height = h;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    },

    setOrigin(x, y) {
      originX = x;
      originY = y;
    },

    emit(burst) {
      if (destroyed) return;
      // See `LOOP_STALE_MS`: only spawn while frames are genuinely running.
      if (performance.now() - lastFrameAt > LOOP_STALE_MS) return;
      // Board coordinates in, canvas coordinates out — see `setOrigin`.
      spawn({ ...burst, x: burst.x + originX, y: burst.y + originY });
    },

    frame(dt) {
      if (destroyed) return;
      lastFrameAt = performance.now();
      elapsed += dt;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      for (const p of pool) {
        if (p.life <= 0) continue;

        const damping = Math.max(0, 1 - p.drag * dt);
        const flutter =
          p.kind === BurstKind.confetti ? Math.sin(elapsed * 5.5 + p.seed) * 130 * dt : 0;

        p.vx = p.vx * damping + flutter;
        p.vy = p.vy * damping + p.gravity * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        p.angle += p.spin * dt * 5;
        if (p.life <= 0) continue;

        const age = 1 - p.life / p.maxLife;
        const fade = 1 - Math.max(0, (age - 0.45) / 0.55);
        const grow = Math.min(1, age / 0.12) * (1 - Math.max(0, (age - 0.55) / 0.45) * 0.75);
        const size = p.size * (0.35 + grow);

        ctx.globalAlpha = Math.max(0, Math.min(1, fade));

        if (p.kind === BurstKind.confetti) {
          // Confetti is a solid card on the GPU too — its glow term is masked
          // out there — so it stays a flat fill here.
          ctx.fillStyle = p.color;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.fillRect(-size, -size * 0.42, size * 2, size * 0.84);
          ctx.restore();
        } else if (p.sprite) {
          // Diameter `size * 2`, matching the GPU's quad of ±size per corner.
          ctx.drawImage(p.sprite, p.x - size, p.y - size, size * 2, size * 2);
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
    },

    clear() {
      for (const p of pool) p.life = 0;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
    },

    destroy() {
      destroyed = true;
    },
  };

  // Sized up front rather than waiting for the first frame, so a burst emitted
  // immediately after creation is not drawn into an unsized canvas.
  field.resize(canvas.clientWidth || 1, canvas.clientHeight || 1);
  return field;
}
