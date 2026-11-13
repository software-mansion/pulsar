import Foundation
@preconcurrency import CoreHaptics
import QuartzCore
import UIKit

/// Plays a pattern in time with another clock, such as a video's. The continuous layer is cut into one event per
/// rumble, from one silent point to the next, with the envelope on parameter curves. Curves scale every event in their
/// pattern, so the taps play from a second player that seeks and resumes with the first.
///
/// Every method can be called from any thread and returns at once. The work runs in order on the player's own queue.
@objc public final class SeekablePatternPlayer: NSObject, @unchecked Sendable {
  // `@unchecked Sendable` is justified: all stored state is read and written on `queue`.

  static let schedulingMargin: TimeInterval = 0.01
  /// Well under Core Haptics' 30 s limit for a continuous event, leaving room for slow rates.
  static let maxPieceDuration: TimeInterval = 10
  static let maxCurvePoints = 16

  private struct Timeline {
    let offset: TimeInterval
    let rate: Float
    let hostTime: TimeInterval

    func offset(at time: TimeInterval) -> TimeInterval {
      offset + (time - hostTime) * TimeInterval(rate)
    }
  }

  private enum PlayerError: LocalizedError {
    case notPrepared

    var errorDescription: String? {
      "prepare() wasn't called"
    }
  }

  private let queue = DispatchQueue(label: "com.swmansion.pulsar.SeekablePatternPlayer")
  private var patterns: [CHHapticPattern] = []
  private var engine: CHHapticEngine?
  private var players: [CHHapticAdvancedPatternPlayer] = []
  private var playerStartTime: TimeInterval?
  private var timeline: Timeline?
  private var isHapticsEnabled: Bool
  private var errorHandler: (@Sendable (Error) -> Void)?
  private var activationObserver: NSObjectProtocol?

  init(isHapticsEnabled: Bool) {
    self.isHapticsEnabled = isHapticsEnabled
    super.init()
    activationObserver = NotificationCenter.default.addObserver(
      forName: UIApplication.didBecomeActiveNotification,
      object: nil,
      queue: nil
    ) { [weak self] _ in
      self?.queue.async { [weak self] in
        self?.resumeOutput()
      }
    }
  }

  deinit {
    if let activationObserver {
      NotificationCenter.default.removeObserver(activationObserver)
    }
    players.forEach { try? $0.cancel() }
    Self.stop(engine)
  }
}

// MARK: - Public API

public extension SeekablePatternPlayer {

  @objc func prepare(_ data: PatternData) {
    // PatternData only has `let` properties, so the queue can read it after this returns.
    nonisolated(unsafe) let data = data
    queue.async { [self] in
      timeline = nil
      cancelPlayers()
      do {
        patterns = try Self.makePatterns(data)
      } catch {
        patterns = []
        fail("Error parsing seekable pattern", error)
        return
      }
      prepareQuietly()
    }
  }

  /// Plays from `fromMs` at `hostTime` on the `CACurrentMediaTime()` clock. Calling it again while playing seeks,
  /// resumes or changes rate in place. A rate of 0 or less pauses.
  @objc func play(fromMs: Double, rate: Float, atHostTime hostTime: TimeInterval) {
    queue.async { [self] in
      guard rate > 0 else {
        timeline = nil
        stopOutput()
        return
      }
      timeline = Timeline(offset: fromMs / 1000, rate: rate, hostTime: hostTime)
      startOutput()
    }
  }

  /// Also drops a start that's still to come.
  @objc func pause() {
    queue.async { [self] in
      timeline = nil
      stopOutput()
    }
  }

  @objc func dispose() {
    queue.async { [self] in
      timeline = nil
      cancelPlayers()
      Self.stop(engine)
      engine = nil
      patterns = []
    }
  }

  /// Called on the player's queue when parsing, preparing, playing or pausing fails. After a failed start the player
  /// tries again when the engine restarts or the app becomes active, until `pause()`.
  @objc func setErrorHandler(_ handler: @escaping @Sendable (Error) -> Void) {
    queue.async { [self] in
      errorHandler = handler
    }
  }
}

// MARK: - Internal State

extension SeekablePatternPlayer {

  /// Keeps the pattern, so `play` still works afterwards.
  func shutDown() {
    queue.async { [self] in
      timeline = nil
      cancelPlayers()
      Self.stop(engine)
      engine = nil
    }
  }

  func setHapticsEnabled(_ state: Bool) {
    queue.async { [self] in
      isHapticsEnabled = state
      if state {
        resumeOutput()
      } else {
        stopOutput()
      }
    }
  }
}

// MARK: - Output

private extension SeekablePatternPlayer {

  func startOutput() {
    guard let timeline, isHapticsEnabled else { return }
    do {
      // Making the players can start the engine, so the start time is worked out after.
      var prepared = try preparedPlayers()
      if isStartPending {
        // Core Haptics doesn't document what a pause or seek does to a resume that's still to come.
        cancelPlayers()
        prepared = try preparedPlayers()
      } else if playerStartTime != nil {
        try prepared.forEach { try $0.pause(atTime: CHHapticTimeImmediate) }
      }
      var startTime = max(timeline.hostTime, CACurrentMediaTime() + Self.schedulingMargin)
      var offset = timeline.offset(at: startTime)
      if offset < 0 {
        startTime -= offset / TimeInterval(timeline.rate)
        offset = 0
      }
      let engineStartTime = engineTime(forHostTime: startTime)
      for player in prepared {
        player.playbackRate = timeline.rate
        try player.seek(toOffset: offset)
        try player.resume(atTime: engineStartTime)
      }
      playerStartTime = startTime
    } catch {
      cancelPlayers()
      fail("Error playing seekable pattern", error)
    }
  }

  func stopOutput() {
    guard !players.isEmpty, playerStartTime != nil else { return }
    if isStartPending {
      cancelPlayers()
      prepareQuietly()
      return
    }
    do {
      try players.forEach { try $0.pause(atTime: CHHapticTimeImmediate) }
      playerStartTime = nil
    } catch {
      cancelPlayers()
      fail("Error pausing seekable pattern", error)
    }
  }

  func resumeOutput() {
    guard timeline != nil, playerStartTime == nil else { return }
    startOutput()
  }

  func fail(_ message: String, _ error: Error) {
    print("\(message): \(error.localizedDescription)")
    errorHandler?(error)
  }

  var isStartPending: Bool {
    playerStartTime.map { $0 > CACurrentMediaTime() } ?? false
  }

  func engineTime(forHostTime hostTime: TimeInterval) -> TimeInterval {
    guard let engine else { return CHHapticTimeImmediate }
    return hostTime + engine.currentTime - CACurrentMediaTime()
  }
}

// MARK: - Engine and Players

private extension SeekablePatternPlayer {

  /// Started and paused, so that every play is a seek plus resume.
  func preparedPlayers() throws -> [CHHapticAdvancedPatternPlayer] {
    if !players.isEmpty { return players }
    guard !patterns.isEmpty else { throw PlayerError.notPrepared }

    let engine = try engine ?? makeEngine()
    try engine.start()
    let prepared = try patterns.map { try engine.makeAdvancedPlayer(with: $0) }
    for player in prepared {
      let playerID = ObjectIdentifier(player)
      player.completionHandler = { [weak self] _ in
        self?.queue.async { [weak self] in
          self?.playerFinished(playerID)
        }
      }
      try player.start(atTime: CHHapticTimeImmediate)
      try player.pause(atTime: CHHapticTimeImmediate)
    }
    players = prepared
    playerStartTime = nil
    return prepared
  }

  func prepareQuietly() {
    do {
      _ = try preparedPlayers()
    } catch {
      fail("Error preparing seekable pattern", error)
    }
  }

  func makeEngine() throws -> CHHapticEngine {
    let engine = try CHHapticEngine()
    engine.playsHapticsOnly = true
    engine.stoppedHandler = { [weak self] _ in
      self?.queue.async { [weak self] in
        self?.engineStopped()
      }
    }
    engine.resetHandler = { [weak self] in
      self?.queue.async { [weak self] in
        self?.engineStopped()
      }
    }
    self.engine = engine
    return engine
  }

  /// The engine finishes stopping after `stop` returns, so it's kept alive until then.
  static func stop(_ engine: CHHapticEngine?) {
    engine?.stop { error in
      withExtendedLifetime(engine) {}
      if let error {
        print("Error stopping seekable pattern engine: \(error.localizedDescription)")
      }
    }
  }

  /// Also for a suspended app: the restart fails in the background, and becoming active resumes it.
  func engineStopped() {
    dropPlayers()
    resumeOutput()
  }

  func cancelPlayers() {
    for player in players {
      do {
        try player.cancel()
      } catch {
        print("Error cancelling seekable pattern: \(error.localizedDescription)")
      }
    }
    dropPlayers()
  }

  func dropPlayers() {
    players = []
    playerStartTime = nil
  }

  /// Both patterns end at the same time, so either player finishing means the pattern has.
  func playerFinished(_ playerID: ObjectIdentifier) {
    guard players.contains(where: { ObjectIdentifier($0) == playerID }) else { return }
    timeline = nil
    dropPlayers()
  }
}

// MARK: - Pattern

extension SeekablePatternPlayer {

  /// The taps, then the continuous layer if there is one.
  static func makePatterns(_ data: PatternData) throws -> [CHHapticPattern] {
    let amplitude = data.continuousPattern.amplitude
    let frequency = data.continuousPattern.frequency
    let endMs = max(
      data.discretePattern.map(\.time).max() ?? 0,
      amplitude.map(\.time).max() ?? 0,
      frequency.map(\.time).max() ?? 0
    )
    let endMarker = CHHapticEvent(
      eventType: .hapticTransient,
      parameters: [CHHapticEventParameter(parameterID: .hapticIntensity, value: 0)],
      relativeTime: endMs / 1000
    )
    let taps = data.discretePattern.map { point in
      CHHapticEvent(
        eventType: .hapticTransient,
        parameters: [
          CHHapticEventParameter(parameterID: .hapticIntensity, value: clamped(point.amplitude)),
          CHHapticEventParameter(parameterID: .hapticSharpness, value: clamped(point.frequency))
        ],
        relativeTime: point.time / 1000
      )
    }
    var patterns = [try CHHapticPattern(events: taps + [endMarker], parameters: [])]

    let pieces = makeContinuousEvents(amplitude: amplitude, frequency: frequency)
    if !pieces.isEmpty {
      let curves = makeCurves(.hapticIntensityControl, amplitude) + makeCurves(.hapticSharpnessControl, frequency)
      patterns.append(try CHHapticPattern(events: pieces + [endMarker], parameterCurves: curves))
    }
    return patterns
  }

  /// A rumble runs from the last silent amplitude point before it to the first one after it, in events of at most
  /// `maxPieceDuration`.
  static func makeContinuousEvents(amplitude: [ValuePoint], frequency: [ValuePoint]) -> [CHHapticEvent] {
    guard !amplitude.isEmpty, !frequency.isEmpty else { return [] }

    let end = max(amplitude.map(\.time).max() ?? 0, frequency.map(\.time).max() ?? 0)
    var rumbles: [(start: Double, stop: Double)] = []
    // Curves hold their first value before the first point and their last value after the last.
    var lastSilence = 0.0
    var rumbleStart: Double?
    for point in amplitude {
      if point.value > 0 {
        rumbleStart = rumbleStart ?? lastSilence
      } else {
        if let start = rumbleStart {
          rumbles.append((start, point.time))
          rumbleStart = nil
        }
        lastSilence = point.time
      }
    }
    if let start = rumbleStart {
      rumbles.append((start, end))
    }

    var events: [CHHapticEvent] = []
    for (start, stop) in rumbles where stop > start {
      let stretch = (stop - start) / 1000
      let count = Int((stretch / maxPieceDuration).rounded(.up))
      let duration = stretch / Double(count)
      for index in 0..<count {
        events.append(
          CHHapticEvent(
            eventType: .hapticContinuous,
            parameters: [
              CHHapticEventParameter(parameterID: .hapticIntensity, value: 1),
              CHHapticEventParameter(parameterID: .hapticSharpness, value: 0)
            ],
            relativeTime: start / 1000 + Double(index) * duration,
            duration: duration
          )
        )
      }
    }
    return events
  }

  /// Curves of at most `maxCurvePoints`, each starting on the last point of the one before. Like `PatternComposer`'s,
  /// they hold the first value from 0.
  static func makeCurves(_ parameter: CHHapticDynamicParameter.ID, _ points: [ValuePoint]) -> [CHHapticParameterCurve] {
    guard let first = points.first else { return [] }
    let points = first.time > 0 ? [ValuePoint(time: 0, value: first.value)] + points : points

    var curves: [CHHapticParameterCurve] = []
    var index = 0
    repeat {
      let chunk = points[index..<min(index + maxCurvePoints, points.count)]
      let curveStart = (chunk.first?.time ?? 0) / 1000
      curves.append(
        CHHapticParameterCurve(
          parameterID: parameter,
          controlPoints: chunk.map {
            CHHapticParameterCurve.ControlPoint(relativeTime: $0.time / 1000 - curveStart, value: clamped($0.value))
          },
          relativeTime: curveStart
        )
      )
      index = chunk.endIndex - 1
    } while index < points.count - 1
    return curves
  }

  private static func clamped(_ value: Float) -> Float {
    min(max(value, 0), 1)
  }
}
