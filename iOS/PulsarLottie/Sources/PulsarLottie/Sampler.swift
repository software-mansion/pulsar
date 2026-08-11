import Foundation
import Pulsar

/// Reads a Pulsar ``PatternData`` into per-frame `RealtimeComposer` inputs.
///
/// The core's `PatternData` exposes a public initializer but keeps its stored
/// properties `internal`, so we read it through its public `Codable`
/// conformance (encode → decode into a local mirror). No UIKit/CoreHaptics
/// dependencies here, so it is trivially unit-testable.

/// A single point on a continuous envelope.
struct EnvPoint {
    let time: Double
    let value: Float
}

/// A discrete transient.
struct DiscEvent {
    let time: Double
    let amplitude: Float
    let frequency: Float
}

/// A `PatternData` flattened into plain arrays ready for sampling.
struct SampledPattern {
    let amplitude: [EnvPoint]
    let frequency: [EnvPoint]
    let discrete: [DiscEvent]

    var hasContinuous: Bool { !amplitude.isEmpty && !frequency.isEmpty }
}

private struct PatternMirror: Decodable {
    struct Value: Decodable {
        let time: Double
        let value: Float
    }
    struct Continuous: Decodable {
        let amplitude: [Value]
        let frequency: [Value]
    }
    struct Discrete: Decodable {
        let time: Double
        let amplitude: Float
        let frequency: Float
    }
    let continuousPattern: Continuous
    let discretePattern: [Discrete]
}

/// Flatten a `PatternData` into a ``SampledPattern`` via its `Codable` form.
/// Returns `nil` only if encoding/decoding unexpectedly fails.
func sampledPattern(from pattern: PatternData) -> SampledPattern? {
    guard
        let data = try? JSONEncoder().encode(pattern),
        let mirror = try? JSONDecoder().decode(PatternMirror.self, from: data)
    else {
        return nil
    }
    return SampledPattern(
        amplitude: mirror.continuousPattern.amplitude.map { EnvPoint(time: $0.time, value: $0.value) },
        frequency: mirror.continuousPattern.frequency.map { EnvPoint(time: $0.time, value: $0.value) },
        discrete: mirror.discretePattern.map { DiscEvent(time: $0.time, amplitude: $0.amplitude, frequency: $0.frequency) }
    )
}

/// Linear-interpolate a breakpoint envelope at time `t` (ms).
func sampleEnvelope(_ points: [EnvPoint], _ t: Double) -> Float {
    let n = points.count
    if n == 0 { return 0 }
    let first = points[0]
    if t <= first.time { return first.value }
    let last = points[n - 1]
    if t >= last.time { return last.value }
    for i in 1..<n {
        let b = points[i]
        if t <= b.time {
            let a = points[i - 1]
            let span = b.time - a.time
            if span <= 0 { return b.value }
            let k = Float((t - a.time) / span)
            return a.value + (b.value - a.value) * k
        }
    }
    return last.value
}

/// Total pattern length in ms — the largest timestamp across all channels.
func patternDurationMs(_ pattern: SampledPattern) -> Double {
    var maxT = 0.0
    for e in pattern.discrete where e.time > maxT { maxT = e.time }
    for e in pattern.amplitude where e.time > maxT { maxT = e.time }
    for e in pattern.frequency where e.time > maxT { maxT = e.time }
    return maxT
}

/// Clamp `v` into `[0, 1]`.
func clamp01(_ v: Float) -> Float {
    if v < 0 { return 0 }
    if v > 1 { return 1 }
    return v
}
