import Foundation

/// Re-anchors an authored pattern so that playing it from zero sounds like playing the
/// original from `fromMs`. The composer only ever starts at zero, so seeking replays a
/// shifted copy.
enum PatternSeek {
  /// The value the envelope holds at `atMs`, interpolating between the surrounding points.
  static func value(of points: [ValuePoint], at atMs: Double) -> Float {
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

  /// An envelope whose points all sit before the seek HOLDS its last value for the rest of
  /// the pattern rather than emptying. Emptying it would silence the whole continuous
  /// channel: the composer builds that channel only when the amplitude AND frequency curves
  /// are both non-empty, so seeking past the end of either one kills both.
  static func envelope(_ points: [ValuePoint], from fromMs: Double, remaining remainingMs: Double) -> [ValuePoint] {
    if points.isEmpty { return [] }
    let held = ValuePoint(time: 0, value: value(of: points, at: fromMs))
    let rest = points
      .filter { $0.time > fromMs }
      .map { ValuePoint(time: $0.time - fromMs, value: $0.value) }
    if !rest.isEmpty { return [held] + rest }
    return remainingMs > 0 ? [held, ValuePoint(time: remainingMs, value: held.value)] : [held]
  }

  /// The last authored timestamp in the pattern, across both lines.
  static func duration(of pattern: PatternData) -> Double {
    let latest = { (times: [Double]) in times.reduce(0) { max($0, $1) } }
    return max(
      latest(pattern.discretePattern.map { $0.time }),
      max(
        latest(pattern.continuousPattern.amplitude.map { $0.time }),
        latest(pattern.continuousPattern.frequency.map { $0.time })
      )
    )
  }

  /// Drops the discrete events before `fromMs`, rebases the rest, and re-anchors both envelopes.
  static func pattern(_ pattern: PatternData, from fromMs: Double) -> PatternData {
    if fromMs <= 0 { return pattern }
    let remainingMs = duration(of: pattern) - fromMs
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

  /// Where the audio file and the haptics line up after a seek.
  ///
  /// A sound offset by `offset` ms is at file position `t - offset` when the haptics are at
  /// `t`, so seeking to `fromMs` either advances into the file or eats into the lead-in. A zero
  /// `duration` means "to the end of the file", so only an authored trim window shrinks.
  static func soundWindow(
    offset: Double,
    start: Double,
    duration: Double,
    from fromMs: Double
  ) -> (start: Double, duration: Double, offset: Double) {
    let lead = max(0, offset)
    let intoFile = max(0, fromMs - lead)
    return (
      start: start + intoFile,
      duration: duration > 0 ? max(0, duration - intoFile) : 0,
      offset: max(0, lead - fromMs)
    )
  }
}
