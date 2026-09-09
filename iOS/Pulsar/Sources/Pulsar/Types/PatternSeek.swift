import Foundation

/// Re-anchors an authored pattern so playing it from zero feels like playing the original
/// from `fromMs`. The composer only ever starts at zero.
enum PatternSeek {
  static func interpolatedValue(of points: [ValuePoint], at atMs: Double) -> Float {
    guard let first = points.first, let last = points.last else { return 0 }
    if atMs <= first.time { return first.value }
    if atMs >= last.time { return last.value }
    guard let nextIndex = points.firstIndex(where: { $0.time > atMs }), nextIndex > 0 else {
      return last.value
    }
    let before = points[nextIndex - 1]
    let after = points[nextIndex]
    let span = after.time - before.time
    if span <= 0 { return after.value }
    return before.value + (after.value - before.value) * Float((atMs - before.time) / span)
  }

  static func envelope(_ points: [ValuePoint], from fromMs: Double, remaining remainingMs: Double) -> [ValuePoint] {
    if points.isEmpty { return [] }
    let valueAtSeek = ValuePoint(time: 0, value: interpolatedValue(of: points, at: fromMs))
    let pointsAfterSeek = points
      .filter { $0.time > fromMs }
      .map { ValuePoint(time: $0.time - fromMs, value: $0.value) }
    if !pointsAfterSeek.isEmpty { return [valueAtSeek] + pointsAfterSeek }
    return holdingLastValue(valueAtSeek, for: remainingMs)
  }

  /// Emptying an envelope would silence BOTH continuous channels — the composer builds that
  /// line only when the amplitude and frequency curves are each non-empty.
  private static func holdingLastValue(_ point: ValuePoint, for remainingMs: Double) -> [ValuePoint] {
    remainingMs > 0 ? [point, ValuePoint(time: remainingMs, value: point.value)] : [point]
  }

  static func lastTimestamp(of pattern: PatternData) -> Double {
    let latest = { (times: [Double]) in times.reduce(0) { max($0, $1) } }
    return max(
      latest(pattern.discretePattern.map { $0.time }),
      max(
        latest(pattern.continuousPattern.amplitude.map { $0.time }),
        latest(pattern.continuousPattern.frequency.map { $0.time })
      )
    )
  }

  static func pattern(_ pattern: PatternData, from fromMs: Double) -> PatternData {
    if fromMs <= 0 { return pattern }
    let remainingMs = lastTimestamp(of: pattern) - fromMs
    return PatternData(
      continuousPattern: ContinuousPattern(
        amplitude: envelope(pattern.continuousPattern.amplitude, from: fromMs, remaining: remainingMs),
        frequency: envelope(pattern.continuousPattern.frequency, from: fromMs, remaining: remainingMs)
      ),
      discretePattern: pattern.discretePattern
        .filter { $0.time >= fromMs }
        .map { DiscretePoint(time: $0.time - fromMs, amplitude: $0.amplitude, frequency: $0.frequency) }
    )
  }

  /// Audio offset by `offset` sits at file position `t - offset` when the haptics are at `t`,
  /// so a seek is spent on the lead-in first and only then on the file.
  static func soundWindow(
    offset: Double,
    start: Double,
    duration: Double,
    from fromMs: Double
  ) -> (start: Double, duration: Double, offset: Double) {
    let leadIn = max(0, offset)
    let seekIntoFile = max(0, fromMs - leadIn)
    let playsToEndOfFile = duration <= 0
    return (
      start: start + seekIntoFile,
      duration: playsToEndOfFile ? 0 : max(0, duration - seekIntoFile),
      offset: max(0, leadIn - fromMs)
    )
  }
}
