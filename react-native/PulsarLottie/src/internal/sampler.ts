import type { Pattern } from 'react-native-pulsar';

/**
 * Worklet-safe helpers that turn a Pulsar {@link Pattern} into per-frame
 * `RealtimeComposer` inputs. Everything here runs on the UI thread inside a
 * Reanimated frame callback, so it uses only plain arithmetic over plain
 * arrays (no closures over React state).
 */

export interface EnvelopePoint {
  time: number;
  value: number;
}

/** Linear-interpolate a breakpoint envelope (`{time,value}[]`) at time `t` (ms). */
export function sampleEnvelope(points: readonly EnvelopePoint[], t: number): number {
  'worklet';
  const n = points.length;
  if (n === 0) {
    return 0;
  }
  const first = points[0]!;
  if (t <= first.time) {
    return first.value;
  }
  const last = points[n - 1]!;
  if (t >= last.time) {
    return last.value;
  }
  for (let i = 1; i < n; i++) {
    const b = points[i]!;
    if (t <= b.time) {
      const a = points[i - 1]!;
      const span = b.time - a.time;
      if (span <= 0) {
        return b.value;
      }
      const k = (t - a.time) / span;
      return a.value + (b.value - a.value) * k;
    }
  }
  return last.value;
}

/** Clamp `v` into `[lo, hi]`. */
export function clamp(v: number, lo: number, hi: number): number {
  'worklet';
  return v < lo ? lo : v > hi ? hi : v;
}

/** Total pattern length in ms — the largest timestamp across all channels. */
export function patternDurationMs(pattern: Pattern): number {
  let max = 0;
  for (let i = 0; i < pattern.discretePattern.length; i++) {
    max = Math.max(max, pattern.discretePattern[i]!.time);
  }
  for (let i = 0; i < pattern.continuousPattern.amplitude.length; i++) {
    max = Math.max(max, pattern.continuousPattern.amplitude[i]!.time);
  }
  for (let i = 0; i < pattern.continuousPattern.frequency.length; i++) {
    max = Math.max(max, pattern.continuousPattern.frequency[i]!.time);
  }
  return max;
}

/** Derive the animation duration (ms) from an inline Lottie JSON source, if present. */
export function lottieDurationMs(source: unknown): number | undefined {
  if (source && typeof source === 'object') {
    const doc = source as { fr?: number; ip?: number; op?: number };
    if (typeof doc.fr === 'number' && typeof doc.op === 'number') {
      const fr = doc.fr || 30;
      const ip = typeof doc.ip === 'number' ? doc.ip : 0;
      const op = doc.op;
      if (fr > 0 && op > ip) {
        return ((op - ip) / fr) * 1000;
      }
    }
  }
  return undefined;
}
