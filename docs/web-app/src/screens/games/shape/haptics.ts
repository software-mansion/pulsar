import { PatternComposer, Settings } from 'pulsar-haptics';
import type { HapticPattern } from 'pulsar-haptics';

/**
 * The game's haptic vocabulary.
 *
 * Two things shape every pattern here. First, web haptics are pulse-width
 * modulated: `intensity` stretches each vibration shot and `frequency` tightens
 * the gaps between them, so "heavy" reads as long shots and "buzzy" reads as
 * tight ones. Second, the Vibration API owns a single global timeline — playing
 * a pattern *cancels* whatever was mid-flight rather than layering on top of
 * it. A cascade fires a dozen events inside a second, so without arbitration
 * the finale of a five-chain would be cut off by a stray tile-landing tick.
 * `playHaptic` therefore takes a priority and refuses to interrupt anything
 * more important that is still playing.
 */

/** Higher wins. A landing tick must never talk over a combo finale. */
export const Priority = {
  tick: 0,
  move: 1,
  match: 2,
  special: 3,
  finale: 4,
} as const;

export type HapticPriority = (typeof Priority)[keyof typeof Priority];

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

let playingUntil = 0;
let playingPriority = -1;

/** Total wall-clock length of a pattern — how long it will hold the timeline. */
export function patternDuration(pattern: HapticPattern): number {
  return pattern.reduce((end, segment) => Math.max(end, segment.timestamp + segment.duration), 0);
}

export function playHaptic(pattern: HapticPattern, priority: HapticPriority): boolean {
  if (pattern.length === 0) return false;

  const now = performance.now();
  if (now < playingUntil && priority < playingPriority) return false;

  const composer = new PatternComposer();
  composer.parse(pattern);
  const played = composer.play();

  playingUntil = now + patternDuration(pattern);
  playingPriority = priority;
  return played;
}

/** Silences the motor and clears the arbitration state — call this on unmount. */
export function resetHaptics() {
  playingUntil = 0;
  playingPriority = -1;
  Settings.stopHaptics();
}

export const hapticsAvailable = () => Settings.isHapticsAvailable();

// ------------------------------------------------------------- vocabulary --

/** Picking a shape up: the lightest thing the motor can say. */
export const selectPattern: HapticPattern = [
  { type: 'pulse', timestamp: 0, duration: 24, intensity: 0.35, frequency: 0.55 },
];

/**
 * The swap itself. A rising-then-falling line reads as one shape sliding past
 * another rather than as two separate taps.
 */
export const swapPattern: HapticPattern = [
  {
    type: 'line',
    timestamp: 0,
    duration: 110,
    intensity: [
      { time: 0, value: 0.3 },
      { time: 55, value: 0.85 },
      { time: 110, value: 0.35 },
    ],
    frequency: [
      { time: 0, value: 0.45 },
      { time: 110, value: 0.9 },
    ],
  },
];

/** Illegal swap: two blunt, low knocks — the universal "nope". */
export const rejectPattern: HapticPattern = [
  { type: 'pulse', timestamp: 0, duration: 70, intensity: 0.95, frequency: 0.12 },
  { type: 'pulse', timestamp: 105, duration: 70, intensity: 0.95, frequency: 0.12 },
];

/**
 * A colour match. Bigger groups hit harder and last longer; deeper cascades sit
 * higher, so a five-chain climbs instead of repeating one thump.
 */
export function matchPattern(tiles: number, cascade: number): HapticPattern {
  const weight = clamp01((tiles - 3) / 9);
  const climb = clamp01((cascade - 1) / 5);
  const duration = Math.round(64 + weight * 90);

  const pattern: HapticPattern = [
    {
      type: 'pulse',
      timestamp: 0,
      duration,
      intensity: clamp01(0.5 + weight * 0.45),
      frequency: clamp01(0.42 + climb * 0.5),
    },
  ];

  // A big group gets a short echo, so "huge" is distinguishable from "loud".
  if (tiles >= 6) {
    pattern.push({
      type: 'pulse',
      timestamp: duration + 45,
      duration: 50,
      intensity: clamp01(0.45 + weight * 0.3),
      frequency: 0.75,
    });
  }

  return pattern;
}

/**
 * Shapes settling after a clear: a thinning scatter of ticks rather than one
 * block, so the hand reads "several things landed" instead of "one big event".
 */
export function landingPattern(tiles: number, distance: number): HapticPattern {
  const ticks = Math.min(6, Math.max(2, Math.round(tiles / 5)));
  const span = Math.min(320, 90 + distance * 34);

  return Array.from({ length: ticks }, (_, i) => {
    const progress = i / Math.max(1, ticks - 1);
    return {
      type: 'pulse' as const,
      // Slightly uneven spacing — perfectly regular ticks read as a machine.
      timestamp: Math.round(progress * span + (i % 2) * 12),
      duration: 26,
      intensity: clamp01(0.42 - progress * 0.22),
      frequency: 0.7,
    };
  });
}

/** A striped shape being *made* — a quick two-step, the stripe snapping in. */
export const stripedBornPattern: HapticPattern = [
  { type: 'pulse', timestamp: 0, duration: 34, intensity: 0.55, frequency: 0.85 },
  { type: 'pulse', timestamp: 62, duration: 54, intensity: 0.9, frequency: 0.7 },
];

export const wrappedBornPattern: HapticPattern = [
  { type: 'continuous', timestamp: 0, duration: 44 },
  { type: 'pulse', timestamp: 78, duration: 62, intensity: 0.85, frequency: 0.35 },
];

export const bombBornPattern: HapticPattern = [
  {
    type: 'line',
    timestamp: 0,
    duration: 260,
    intensity: [
      { time: 0, value: 0.25 },
      { time: 260, value: 1 },
    ],
    frequency: [
      { time: 0, value: 0.3 },
      { time: 260, value: 0.95 },
    ],
  },
  { type: 'continuous', timestamp: 275, duration: 55 },
];

/**
 * A stripe firing. The beam crosses the board in a straight line, so the haptic
 * is a single sweep whose gaps tighten as it travels — a zip, not a bang.
 */
export const stripeSweepPattern: HapticPattern = [
  {
    type: 'line',
    timestamp: 0,
    duration: 240,
    intensity: [
      { time: 0, value: 0.4 },
      { time: 70, value: 1 },
      { time: 240, value: 0.2 },
    ],
    frequency: [
      { time: 0, value: 0.95 },
      { time: 240, value: 0.35 },
    ],
  },
];

/** A wrapped shape detonating: the classic thump-THUMP double blast. */
export const wrappedBlastPattern: HapticPattern = [
  { type: 'continuous', timestamp: 0, duration: 52 },
  { type: 'pulse', timestamp: 130, duration: 120, intensity: 1, frequency: 0.22 },
];

/** A colour bomb: hard attack, then a rumble that decays like a shockwave. */
export const bombBlastPattern: HapticPattern = [
  { type: 'continuous', timestamp: 0, duration: 70 },
  {
    type: 'line',
    timestamp: 80,
    duration: 420,
    intensity: [
      { time: 0, value: 1 },
      { time: 420, value: 0.15 },
    ],
    frequency: [
      { time: 0, value: 0.8 },
      { time: 420, value: 0.2 },
    ],
  },
];

/**
 * The combo finale, deliberately built to the same clock as the particle burst:
 * a crescendo while the sparks gather (0-520ms), the hit at the moment the
 * explosion lands (520ms), then thinning sparkle as the confetti falls away.
 * `FINALE_MS` is exported so the visual and the pattern cannot drift apart.
 */
export const FINALE_MS = 980;

export function finalePattern(level: number): HapticPattern {
  const power = clamp01((level - 2) / 5);
  const peak = clamp01(0.7 + power * 0.3);

  const sparkle: HapticPattern = [0, 1, 2, 3].map((i) => ({
    type: 'pulse' as const,
    timestamp: 640 + i * 84,
    duration: 30,
    intensity: clamp01((0.5 - i * 0.1) * (0.7 + power * 0.5)),
    frequency: 0.9,
  }));

  return [
    {
      type: 'line',
      timestamp: 0,
      duration: 520,
      intensity: [
        { time: 0, value: 0.2 },
        { time: 380, value: peak * 0.75 },
        { time: 520, value: peak },
      ],
      frequency: [
        { time: 0, value: 0.28 },
        { time: 520, value: 0.95 },
      ],
    },
    { type: 'continuous', timestamp: 524, duration: 64 + Math.round(power * 40) },
    ...sparkle,
  ];
}

/**
 * "Come and play" — fired when the game opens.
 *
 * Two light taps and a rising swell, kept deliberately gentle: it is a greeting,
 * not an achievement, and it arrives before the player has done anything.
 *
 * Whether it is felt at all is up to the browser. `navigator.vibrate` is
 * ignored without sticky user activation, so this plays for someone who tapped
 * through from the games list and is silently dropped for someone who opened
 * the URL directly — which is the right outcome either way.
 */
export const INVITE_MS = 440;

export const invitePattern: HapticPattern = [
  { type: 'pulse', timestamp: 0, duration: 40, intensity: 0.35, frequency: 0.5 },
  { type: 'pulse', timestamp: 92, duration: 40, intensity: 0.5, frequency: 0.7 },
  {
    type: 'line',
    timestamp: 180,
    duration: 260,
    intensity: [
      { time: 0, value: 0.4 },
      { time: 170, value: 0.8 },
      { time: 260, value: 0.22 },
    ],
    frequency: [
      { time: 0, value: 0.6 },
      { time: 260, value: 0.95 },
    ],
  },
];

/**
 * The "ta-daaa". A crisp hit, a beat of silence, then a swell that blooms and
 * rings out — the gap is what makes the two halves read as one gesture rather
 * than as two unrelated buzzes.
 */
export const FANFARE_MS = 780;

export const fanfarePattern: HapticPattern = [
  // "ta"
  { type: 'pulse', timestamp: 0, duration: 90, intensity: 0.85, frequency: 0.75 },
  // "d-" — the attack of the second syllable
  { type: 'continuous', timestamp: 210, duration: 70 },
  // "-aaa" — holds, then thins out
  {
    type: 'line',
    timestamp: 285,
    duration: 495,
    intensity: [
      { time: 0, value: 0.95 },
      { time: 180, value: 0.8 },
      { time: 495, value: 0.15 },
    ],
    frequency: [
      { time: 0, value: 0.8 },
      { time: 495, value: 0.35 },
    ],
  },
];

/**
 * End of the run. Three settling knocks that lose weight as they go, then a low
 * hold that fades — a cadence that resolves rather than celebrates, so it reads
 * as "that's the game" instead of another combo.
 */
export const GAME_OVER_MS = 1150;

export const gameOverPattern: HapticPattern = [
  { type: 'pulse', timestamp: 0, duration: 80, intensity: 0.8, frequency: 0.6 },
  { type: 'pulse', timestamp: 180, duration: 80, intensity: 0.7, frequency: 0.45 },
  { type: 'pulse', timestamp: 360, duration: 90, intensity: 0.6, frequency: 0.3 },
  { type: 'continuous', timestamp: 520, duration: 90 },
  {
    type: 'line',
    timestamp: 620,
    duration: 530,
    intensity: [
      { time: 0, value: 0.85 },
      { time: 530, value: 0.1 },
    ],
    frequency: [
      { time: 0, value: 0.3 },
      { time: 530, value: 0.12 },
    ],
  },
];
