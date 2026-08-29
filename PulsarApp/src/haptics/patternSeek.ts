import type { Pattern } from 'react-native-pulsar';

export type EnvelopePoint = { time: number; value: number };
type Sound = NonNullable<Pattern['sound']>;

export const PLAYS_TO_END_OF_FILE = 0;

export function envelopeValueAt(points: EnvelopePoint[], atMs: number): number {
  if (points.length === 0) return 0;
  if (atMs <= points[0].time) return points[0].value;
  const last = points[points.length - 1];
  if (atMs >= last.time) return last.value;
  const nextIndex = points.findIndex((point) => point.time > atMs);
  const before = points[nextIndex - 1];
  const after = points[nextIndex];
  const span = after.time - before.time;
  if (span <= 0) return after.value;
  return before.value + ((after.value - before.value) * (atMs - before.time)) / span;
}

function envelopeStartingAt(points: EnvelopePoint[], fromMs: number): EnvelopePoint[] {
  const remaining = points
    .filter((point) => point.time > fromMs)
    .map((point) => ({ time: point.time - fromMs, value: point.value }));
  if (remaining.length === 0) return [];
  return [{ time: 0, value: envelopeValueAt(points, fromMs) }, ...remaining];
}

function soundStartingAt(sound: Sound, fromMs: number): Sound {
  const trimmedWindow = sound.duration;
  return {
    ...sound,
    start: (sound.start ?? 0) + fromMs,
    duration: trimmedWindow ? Math.max(0, trimmedWindow - fromMs) : PLAYS_TO_END_OF_FILE,
  };
}

/** The composer can only play from zero, so seeking replays a re-anchored pattern. */
export function patternStartingAt(pattern: Pattern, fromMs: number): Pattern {
  if (fromMs <= 0) return pattern;
  return {
    discretePattern: pattern.discretePattern
      .filter((point) => point.time >= fromMs)
      .map((point) => ({ ...point, time: point.time - fromMs })),
    continuousPattern: {
      amplitude: envelopeStartingAt(pattern.continuousPattern.amplitude, fromMs),
      frequency: envelopeStartingAt(pattern.continuousPattern.frequency, fromMs),
    },
    ...(pattern.sound ? { sound: soundStartingAt(pattern.sound, fromMs) } : {}),
  };
}

export function patternDurationMs(pattern: Pattern): number {
  const lastTimeOf = (points: { time: number }[]) =>
    points.reduce((latest, point) => Math.max(latest, point.time), 0);
  return Math.max(
    lastTimeOf(pattern.discretePattern),
    lastTimeOf(pattern.continuousPattern.amplitude),
    lastTimeOf(pattern.continuousPattern.frequency),
  );
}
