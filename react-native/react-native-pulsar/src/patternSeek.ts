import type { Pattern } from './types';

type EnvelopePoint = Pattern['continuousPattern']['amplitude'][number];

/** The value the envelope holds at `atMs`, interpolating between the surrounding points. */
function valueAt(points: EnvelopePoint[], atMs: number): number {
  if (points.length === 0) return 0;
  const first = points[0]!;
  const last = points[points.length - 1]!;
  if (atMs <= first.time) return first.value;
  if (atMs >= last.time) return last.value;
  const nextIndex = points.findIndex((point) => point.time > atMs);
  if (nextIndex <= 0) return last.value;
  const before = points[nextIndex - 1]!;
  const after = points[nextIndex]!;
  const span = after.time - before.time;
  if (span <= 0) return after.value;
  return (
    before.value + ((after.value - before.value) * (atMs - before.time)) / span
  );
}

/**
 * An envelope whose points all sit before the seek HOLDS its last value for the rest of the
 * pattern rather than emptying. Emptying it would silence the whole continuous channel: the
 * composer builds that channel only when the amplitude AND frequency curves are both
 * non-empty, so seeking past the end of either one kills both.
 */
function envelopeFrom(
  points: EnvelopePoint[],
  fromMs: number,
  remainingMs: number
): EnvelopePoint[] {
  if (points.length === 0) return [];
  const held = { time: 0, value: valueAt(points, fromMs) };
  const rest = points
    .filter((point) => point.time > fromMs)
    .map((point) => ({ time: point.time - fromMs, value: point.value }));
  if (rest.length > 0) return [held, ...rest];
  return remainingMs > 0
    ? [held, { time: remainingMs, value: held.value }]
    : [held];
}

/** The last authored timestamp in the pattern, across both lines. */
export function patternDurationMs(pattern: Pattern): number {
  const latest = (points: { time: number }[]) =>
    points.reduce((so_far, point) => Math.max(so_far, point.time), 0);
  return Math.max(
    latest(pattern.discretePattern),
    latest(pattern.continuousPattern.amplitude),
    latest(pattern.continuousPattern.frequency)
  );
}

/**
 * Re-anchors a pattern so that playing it from zero feels like playing the original from
 * `fromMs`: discrete events before the seek are dropped and the rest rebased, both envelopes
 * re-anchored. The composer only ever starts at zero, so seeking replays a shifted copy.
 */
export function patternFrom(pattern: Pattern, fromMs: number): Pattern {
  if (fromMs <= 0) return pattern;
  const remainingMs = patternDurationMs(pattern) - fromMs;
  const { sound } = pattern;
  return {
    ...pattern,
    discretePattern: pattern.discretePattern
      .filter((point) => point.time >= fromMs)
      .map((point) => ({ ...point, time: point.time - fromMs })),
    continuousPattern: {
      amplitude: envelopeFrom(
        pattern.continuousPattern.amplitude,
        fromMs,
        remainingMs
      ),
      frequency: envelopeFrom(
        pattern.continuousPattern.frequency,
        fromMs,
        remainingMs
      ),
    },
    ...(sound ? { sound: soundFrom(sound, fromMs) } : {}),
  };
}

/**
 * Where the audio file and the haptics line up after a seek.
 *
 * A sound offset by `offset` ms is at file position `t - offset` when the haptics are at `t`,
 * so seeking to `fromMs` either advances into the file or eats into the lead-in. A zero
 * duration means "to the end of the file", so only an authored window shrinks.
 */
function soundFrom(
  sound: NonNullable<Pattern['sound']>,
  fromMs: number
): NonNullable<Pattern['sound']> {
  const lead = Math.max(0, sound.offset ?? 0);
  const intoFile = Math.max(0, fromMs - lead);
  return {
    ...sound,
    offset: Math.max(0, lead - fromMs),
    start: (sound.start ?? 0) + intoFile,
    duration: sound.duration ? Math.max(0, sound.duration - intoFile) : 0,
  };
}
