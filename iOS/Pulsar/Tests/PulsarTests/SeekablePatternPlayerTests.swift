import Testing
import Foundation
import CoreHaptics
import QuartzCore
@testable import Pulsar

final class ErrorLog: @unchecked Sendable {
  private let lock = NSLock()
  private var errors: [Error] = []

  func append(_ error: Error) {
    lock.lock()
    errors.append(error)
    lock.unlock()
  }

  var all: [Error] {
    lock.lock()
    defer { lock.unlock() }
    return errors
  }
}

@Suite struct SeekablePatternPlayerTests {

  private func points(_ pairs: [(Double, Float)]) -> [ValuePoint] {
    pairs.map { ValuePoint(time: $0.0, value: $0.1) }
  }

  private func spans(_ events: [CHHapticEvent]) -> [(start: Double, end: Double)] {
    events.map { ($0.relativeTime, $0.relativeTime + $0.duration) }
  }

  private func curveEnd(_ curve: CHHapticParameterCurve) -> TimeInterval {
    curve.relativeTime + (curve.controlPoints.last?.relativeTime ?? 0)
  }

  @Test func curvesAreChunkedAtSixteenPointsAndChained() {
    let input = (0..<40).map { ValuePoint(time: Double($0) * 100, value: Float($0 % 2)) }
    let curves = SeekablePatternPlayer.makeCurves(.hapticIntensityControl, input)

    #expect(curves.allSatisfy { $0.controlPoints.count <= SeekablePatternPlayer.maxCurvePoints })
    for (current, next) in zip(curves, curves.dropFirst()) {
      #expect(abs(curveEnd(current) - next.relativeTime) < 1e-9)
      #expect(current.controlPoints.last?.value == next.controlPoints.first?.value)
    }
    #expect(abs(curveEnd(curves[curves.count - 1]) - 3.9) < 1e-9)
    let distinctPoints = curves.reduce(0) { $0 + $1.controlPoints.count } - (curves.count - 1)
    #expect(distinctPoints == 40)
  }

  @Test func curveHoldsItsFirstValueFromZero() {
    let curves = SeekablePatternPlayer.makeCurves(.hapticIntensityControl, points([(500, 0.4), (900, 0.8)]))

    #expect(curves.count == 1)
    #expect(curves[0].controlPoints.map(\.relativeTime) == [0, 0.5, 0.9])
    #expect(curves[0].controlPoints.first?.value == 0.4)
  }

  @Test func curveValuesAreClamped() {
    let curves = SeekablePatternPlayer.makeCurves(.hapticIntensityControl, points([(0, -1), (100, 2)]))

    #expect(curves[0].controlPoints.map(\.value) == [0, 1])
  }

  @Test func curveChunkBoundaries() {
    let single = SeekablePatternPlayer.makeCurves(.hapticIntensityControl, points([(0, 0.4)]))
    #expect(single.count == 1)
    #expect(single[0].controlPoints.count == 1)

    let sixteen = (0..<16).map { ValuePoint(time: Double($0) * 10, value: 0.5) }
    #expect(SeekablePatternPlayer.makeCurves(.hapticIntensityControl, sixteen).count == 1)

    let seventeen = (0..<17).map { ValuePoint(time: Double($0) * 10, value: 0.5) }
    let curves = SeekablePatternPlayer.makeCurves(.hapticIntensityControl, seventeen)
    #expect(curves.count == 2)
    #expect(curves[1].controlPoints.count == 2)

    #expect(SeekablePatternPlayer.makeCurves(.hapticIntensityControl, []).isEmpty)
  }

  @Test func rumblesRunBetweenSilentAmplitudePoints() {
    let events = SeekablePatternPlayer.makeContinuousEvents(
      amplitude: points([(0, 0), (100, 1), (200, 0), (1000, 0), (1100, 1), (1200, 0)]),
      frequency: points([(0, 0.5)])
    )
    let rumbles = spans(events)

    #expect(rumbles.count == 2)
    #expect(abs(rumbles[0].start - 0) < 1e-9 && abs(rumbles[0].end - 0.2) < 1e-9)
    #expect(abs(rumbles[1].start - 1.0) < 1e-9 && abs(rumbles[1].end - 1.2) < 1e-9)
  }

  @Test func rumbleStartingLoudBeginsAtZeroAndItsTailRunsToTheEnd() {
    let events = SeekablePatternPlayer.makeContinuousEvents(
      amplitude: points([(500, 0.7), (900, 0.3)]),
      frequency: points([(0, 0.5), (2000, 0.5)])
    )
    let rumbles = spans(events)

    #expect(rumbles.count == 2)
    #expect(abs(rumbles[0].start) < 1e-9)
    #expect(abs(rumbles[rumbles.count - 1].end - 2.0) < 1e-9)
  }

  @Test func longRumbleIsSplitIntoContiguousShortPieces() {
    let events = SeekablePatternPlayer.makeContinuousEvents(
      amplitude: points([(0, 1), (35_000, 1)]),
      frequency: points([(0, 0.5)])
    )
    let pieces = spans(events)

    #expect(pieces.count == 35)
    #expect(events.allSatisfy { $0.duration <= SeekablePatternPlayer.maxPieceDuration + 1e-9 })
    for (current, next) in zip(pieces, pieces.dropFirst()) {
      #expect(abs(current.end - next.start) < 1e-9)
    }
    #expect(abs(pieces[pieces.count - 1].end - 35) < 1e-9)
  }

  @Test func silentOrFrequencylessPatternHasNoContinuousLayer() throws {
    #expect(SeekablePatternPlayer.makeContinuousEvents(amplitude: points([(0, 0), (500, 0)]), frequency: points([(0, 1)])).isEmpty)
    #expect(SeekablePatternPlayer.makeContinuousEvents(amplitude: points([(0, 1), (500, 1)]), frequency: []).isEmpty)

    let tapsOnly = PatternData(
      continuousPattern: ContinuousPattern(amplitude: [], frequency: []),
      discretePattern: [DiscretePoint(time: 100, amplitude: 1, frequency: 0.5)]
    )
    #expect(try SeekablePatternPlayer.makePatterns(tapsOnly).count == 1)
  }

  @Test func tapsAndRumbleEndTogether() throws {
    let data = PatternData(
      continuousPattern: ContinuousPattern(
        amplitude: points([(0, 0), (100, 1), (300, 0)]),
        frequency: points([(0, 0.2), (300, 0.9)])
      ),
      discretePattern: [DiscretePoint(time: 1500, amplitude: 1, frequency: 0.5)]
    )
    let patterns = try SeekablePatternPlayer.makePatterns(data)

    #expect(patterns.count == 2)
    #expect(abs(patterns[0].duration - patterns[1].duration) < 1e-6)
  }

  @Test func emptyPatternStillParses() throws {
    let empty = PatternData(continuousPattern: ContinuousPattern(amplitude: [], frequency: []), discretePattern: [])

    #expect(try SeekablePatternPlayer.makePatterns(empty).count == 1)
  }

  @Test(.enabled(if: !CHHapticEngine.capabilitiesForHardware().supportsHaptics))
  func staysQuietWithoutHapticsHardware() {
    let player = SeekablePatternPlayer(isHapticsEnabled: true)
    let errors = ErrorLog()
    player.setErrorHandler { errors.append($0) }
    player.prepare(PatternData(
      continuousPattern: ContinuousPattern(amplitude: points([(0, 1), (500, 1)]), frequency: points([(0, 0.5)])),
      discretePattern: [DiscretePoint(time: 100, amplitude: 1, frequency: 0.5)]
    ))
    player.play(fromMs: 0, rate: 1, atHostTime: CACurrentMediaTime())
    player.pause()
    player.waitForPendingWork()

    #expect(errors.all.isEmpty)
  }
}
