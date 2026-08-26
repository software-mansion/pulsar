import { gameAudio } from './audio';
import {
  FINALE_MS,
  Priority,
  bombBlastPattern,
  bombBornPattern,
  finalePattern,
  landingPattern,
  matchPattern,
  playHaptic,
  rejectPattern,
  selectPattern,
  stripeSweepPattern,
  stripedBornPattern,
  swapPattern,
  wrappedBlastPattern,
  wrappedBornPattern,
} from './haptics';
import { BurstKind, type ParticleField } from './particles';
import { NEUTRAL_RGB, candyRgb } from './palette';
import type { SpecialKind } from './engine';

/**
 * One event, one function — and each function fires the haptic, the sound and
 * the particles together.
 *
 * Keeping the three in the same place is what makes "the combo haptic matches
 * the combo visual" true by construction rather than by coincidence: the
 * finale's crescendo, its riser and its confetti are all built against the same
 * `FINALE_MS` budget, and a stripe's sweep haptic is fired with the same
 * direction vector as the particles that follow the beam.
 */

export type Effects = { field: ParticleField | null };

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** How long `.shell--shaking` runs; kept in step with the keyframe in CSS. */
export const SHAKE_MS = 520;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Kicks the whole app shell, not just the board — a wipeout should feel like it
 * happened *to* the player, and stopping the shake at the board's edge reads as
 * a panel wobbling rather than an impact.
 *
 * The class is removed and re-added around a forced reflow because a CSS
 * animation only starts when its name changes; re-adding a class that is still
 * present would leave a second super combo silent.
 */
export function shakeScreen(strength: number) {
  if (prefersReducedMotion()) return;
  const shell = document.querySelector<HTMLElement>('.shell');
  if (!shell) return;

  shell.classList.remove('shell--shaking');
  void shell.offsetWidth;
  shell.style.setProperty('--shake', `${strength.toFixed(1)}px`);
  shell.classList.add('shell--shaking');

  window.setTimeout(() => shell.classList.remove('shell--shaking'), SHAKE_MS);
}

/** Drops any shake in progress — the screen must not be left mid-kick. */
export function clearShake() {
  const shell = document.querySelector<HTMLElement>('.shell');
  shell?.classList.remove('shell--shaking');
}

/**
 * A ring of beams fired out from a point. Reuses the striped candy's `streak`
 * particles, which spawn strung out along their direction rather than in a
 * cloud, so each one reads as a single lance of light.
 */
function laserRing(
  field: ParticleField | null,
  x: number,
  y: number,
  beams: number,
  energy: number,
  spin: number,
) {
  for (let i = 0; i < beams; i++) {
    // `spin` offsets the whole ring so repeat combos never fire the same star.
    const angle = (i / beams) * Math.PI * 2 + spin;
    field?.emit({
      kind: BurstKind.streak,
      x,
      y,
      color: candyRgb[i % candyRgb.length] ?? NEUTRAL_RGB,
      count: 26,
      energy,
      dirX: Math.cos(angle),
      dirY: Math.sin(angle),
    });
  }
}

export function selectEffect() {
  playHaptic(selectPattern, Priority.tick);
  gameAudio.select();
}

export function swapEffect() {
  playHaptic(swapPattern, Priority.move);
  gameAudio.swap();
}

export function rejectEffect() {
  playHaptic(rejectPattern, Priority.move);
  gameAudio.reject();
}

/** A colour match clearing. `points` are the screen positions of the tiles. */
export function matchEffect(
  { field }: Effects,
  points: { x: number; y: number; color: number }[],
  tiles: number,
  cascade: number,
) {
  playHaptic(matchPattern(tiles, cascade), Priority.match);
  gameAudio.match(tiles, cascade);

  const energy = clamp01(0.25 + (cascade - 1) * 0.18 + (tiles - 3) * 0.06);
  for (const point of points) {
    field?.emit({
      kind: BurstKind.pop,
      x: point.x,
      y: point.y,
      color: candyRgb[point.color] ?? NEUTRAL_RGB,
      count: 12 + Math.round(energy * 14),
      energy,
    });
  }
}

/** Candies settling into their new places. */
export function landingEffect(tiles: number, distance: number) {
  playHaptic(landingPattern(tiles, distance), Priority.tick);
  gameAudio.land(tiles, distance);
}

/** A special candy appearing. */
export function bornEffect(
  { field }: Effects,
  special: SpecialKind,
  point: { x: number; y: number; color: number },
) {
  if (special === 'none') return;

  const pattern =
    special === 'bomb'
      ? bombBornPattern
      : special === 'wrapped'
        ? wrappedBornPattern
        : stripedBornPattern;

  playHaptic(pattern, Priority.special);
  gameAudio.born(special === 'bomb' ? 4 : special === 'wrapped' ? 3 : 2);

  field?.emit({
    kind: BurstKind.spark,
    x: point.x,
    y: point.y,
    color: special === 'bomb' ? NEUTRAL_RGB : (candyRgb[point.color] ?? NEUTRAL_RGB),
    count: special === 'bomb' ? 46 : 26,
    energy: special === 'bomb' ? 0.9 : 0.5,
  });
}

/**
 * A special going off. Striped candies fire particles *along their beam* and
 * get the sweeping haptic; wrapped and bomb get radial blasts and the two
 * detonation patterns.
 */
export function blastEffect(
  { field }: Effects,
  special: Exclude<SpecialKind, 'none'>,
  point: { x: number; y: number; color: number },
  board: { width: number; height: number },
) {
  const color = candyRgb[point.color] ?? NEUTRAL_RGB;

  if (special === 'stripedH' || special === 'stripedV') {
    playHaptic(stripeSweepPattern, Priority.special);
    gameAudio.sweep();

    const horizontal = special === 'stripedH';
    // Two beams, one each way, so the burst reads as a line crossing the board.
    for (const sign of [-1, 1]) {
      field?.emit({
        kind: BurstKind.streak,
        x: point.x,
        y: point.y,
        color,
        count: 40,
        energy: 0.85,
        dirX: horizontal ? sign : 0,
        dirY: horizontal ? 0 : sign,
      });
    }
    return;
  }

  const bomb = special === 'bomb';
  playHaptic(bomb ? bombBlastPattern : wrappedBlastPattern, Priority.special);
  gameAudio.blast(bomb ? 1 : 0.45);

  field?.emit({
    kind: BurstKind.explosion,
    x: point.x,
    y: point.y,
    color: bomb ? NEUTRAL_RGB : color,
    count: bomb ? 150 : 80,
    energy: bomb ? 1 : 0.6,
  });

  // A colour bomb takes the whole board, so it throws a second, wider ring.
  if (bomb) {
    field?.emit({
      kind: BurstKind.explosion,
      x: board.width / 2,
      y: board.height / 2,
      color: NEUTRAL_RGB,
      count: 120,
      energy: 1,
    });
  }
}

/**
 * The combo celebration. The riser, the crescendo and the confetti all run on
 * `FINALE_MS`, and the confetti is emitted at the moment the haptic lands its
 * hit, so the burst is felt and seen on the same beat.
 */
export function finaleEffect(
  { field }: Effects,
  level: number,
  board: { width: number; height: number },
  options: { superCombo?: boolean } = {},
): number {
  playHaptic(finalePattern(level), Priority.finale);
  gameAudio.finale(level, FINALE_MS);

  const power = clamp01((level - 2) / 5);
  const hitAt = FINALE_MS * 0.53;
  const centreX = board.width / 2;
  const centreY = board.height * 0.42;

  // A first, tighter ring launches slightly ahead of the hit, so the beams are
  // already racing outward when the explosion and the haptic's peak land.
  window.setTimeout(
    () => laserRing(field, centreX, centreY, 6 + Math.round(power * 4), 0.75, 0),
    hitAt - 90,
  );

  window.setTimeout(() => {
    field?.emit({
      kind: BurstKind.explosion,
      x: centreX,
      y: centreY,
      color: NEUTRAL_RGB,
      count: 110 + Math.round(power * 90),
      energy: 1,
    });

    // The main starburst — more beams the deeper the chain went.
    laserRing(field, centreX, centreY, 10 + Math.round(power * 8), 1, Math.PI / 12);

    if (options.superCombo) {
      // A wipeout throws the screen as well, timed to the same instant the
      // finale haptic lands its hit.
      shakeScreen(7 + power * 6);
    }

    // Confetti rains from across the top edge rather than one point.
    const columns = 7;
    for (let i = 0; i < columns; i++) {
      field?.emit({
        kind: BurstKind.confetti,
        x: (board.width * (i + 0.5)) / columns,
        y: board.height * 0.12,
        color: NEUTRAL_RGB,
        count: 26 + Math.round(power * 18),
        energy: 0.8,
      });
    }
  }, hitAt);

  // A third ring on the way out keeps a super combo alive past the flash.
  if (options.superCombo) {
    window.setTimeout(() => laserRing(field, centreX, centreY, 14, 0.85, Math.PI / 7), hitAt + 150);
  }

  return FINALE_MS;
}

export function shuffleEffect() {
  gameAudio.shuffle();
}

/**
 * How far down the board a banner sits, as a fraction of its height.
 *
 * Duplicated as `--banner-top` in the stylesheet. The two have to agree: this
 * value is where the sparks are thrown, that one is where the pill is drawn,
 * and a mismatch shows up immediately as a banner with its own confetti
 * hovering somewhere else.
 */
export const BANNER_TOP = 0.38;

/** Where the combo counter sits, as a fraction of board height. Matches CSS. */
export const COMBO_TOP = 0.13;

/**
 * A puff under the combo counter each time it ticks up. Small and hot — the
 * chain itself is already throwing candy debris all over the board, so this
 * only has to draw the eye to the number.
 */
export function comboEffect(
  { field }: Effects,
  level: number,
  board: { width: number; height: number },
) {
  if (!field || level < 2) return;
  const heat = clamp01((level - 2) / 6);
  field.emit({
    kind: BurstKind.spark,
    x: board.width / 2,
    y: board.height * COMBO_TOP,
    color: heat > 0.5 ? (candyRgb[0] ?? NEUTRAL_RGB) : (candyRgb[4] ?? NEUTRAL_RGB),
    count: 12 + Math.round(heat * 22),
    energy: 0.35 + heat * 0.55,
  });
}

export type BannerKind = 'bonus' | 'cascade' | 'combo' | 'super' | 'info';

/**
 * Sparks thrown around a banner as it lands, scaled to what it is announcing.
 *
 * Deliberately modest next to `finaleEffect` — this decorates the label, it is
 * not the celebration itself, and a super combo is already firing a full
 * starburst behind it.
 */
export function bannerEffect(
  { field }: Effects,
  kind: BannerKind,
  board: { width: number; height: number },
) {
  // A shuffle notice is housekeeping, not an achievement.
  if (kind === 'info' || !field) return;

  const x = board.width / 2;
  const y = board.height * BANNER_TOP;

  if (kind === 'bonus') {
    field.emit({
      kind: BurstKind.spark,
      x,
      y,
      color: candyRgb[4] ?? NEUTRAL_RGB,
      count: 20,
      energy: 0.3,
    });
    return;
  }

  if (kind === 'cascade') {
    // Two puffs off the ends, so the sparks frame the label rather than hiding it.
    for (const offset of [-0.22, 0.22]) {
      field.emit({
        kind: BurstKind.spark,
        x: x + board.width * offset,
        y,
        color: candyRgb[2] ?? NEUTRAL_RGB,
        count: 22,
        energy: 0.5,
      });
    }
    return;
  }

  const beams = kind === 'super' ? 10 : 6;
  laserRing(field, x, y, beams, kind === 'super' ? 0.9 : 0.6, Math.PI / 9);
  field.emit({
    kind: BurstKind.spark,
    x,
    y,
    color: NEUTRAL_RGB,
    count: kind === 'super' ? 54 : 32,
    energy: kind === 'super' ? 0.85 : 0.55,
  });

  if (kind === 'super') {
    // A second puff a beat later, under the shockwave ring the banner draws.
    window.setTimeout(
      () => field.emit({ kind: BurstKind.spark, x, y, color: NEUTRAL_RGB, count: 34, energy: 0.7 }),
      190,
    );
  }
}
