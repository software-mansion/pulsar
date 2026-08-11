import 'package:pulsar_haptics/pulsar.dart';

/// Turns a Pulsar [PatternData] into per-frame `RealtimeComposer` inputs.
///
/// Pure functions over the ms-based pattern model — no Flutter or platform
/// dependencies, so they are trivially unit-testable.

/// Linear-interpolate a breakpoint envelope at time [t] (ms). Clamps to the
/// first/last point outside the defined range; returns 0 for an empty curve.
double sampleEnvelope(List<ValuePoint> points, double t) {
  final n = points.length;
  if (n == 0) {
    return 0;
  }
  final first = points.first;
  if (t <= first.time) {
    return first.value;
  }
  final last = points.last;
  if (t >= last.time) {
    return last.value;
  }
  for (var i = 1; i < n; i++) {
    final b = points[i];
    if (t <= b.time) {
      final a = points[i - 1];
      final span = b.time - a.time;
      if (span <= 0) {
        return b.value;
      }
      final k = (t - a.time) / span;
      return a.value + (b.value - a.value) * k;
    }
  }
  return last.value;
}

/// Total pattern length in ms — the largest timestamp across all channels.
double patternDurationMs(PatternData pattern) {
  var max = 0.0;
  for (final e in pattern.discretePattern) {
    if (e.time > max) max = e.time;
  }
  for (final e in pattern.continuousPattern.amplitude) {
    if (e.time > max) max = e.time;
  }
  for (final e in pattern.continuousPattern.frequency) {
    if (e.time > max) max = e.time;
  }
  return max;
}

/// Clamp [v] into `[0, 1]`.
double clamp01(double v) => v < 0
    ? 0
    : v > 1
        ? 1
        : v;
