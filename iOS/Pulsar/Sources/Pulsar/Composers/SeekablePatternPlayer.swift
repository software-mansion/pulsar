import Foundation
@preconcurrency import CoreHaptics
import QuartzCore
import UIKit

@objc public enum SeekablePatternPlayerError: Int, LocalizedError {
  case notPrepared

  public var errorDescription: String? {
    switch self {
    case .notPrepared: "No pattern is prepared"
    }
  }
}

@objc public final class SeekablePatternPlayer: NSObject, @unchecked Sendable {
  static let schedulingMargin: TimeInterval = 0.01
  static let maxPieceDuration: TimeInterval = 1
  static let maxCurvePoints = 16

  private struct Timeline {
    let startPosition: TimeInterval
    let rate: Float
    let hostTime: TimeInterval

    func position(at time: TimeInterval) -> TimeInterval {
      startPosition + (time - hostTime) * TimeInterval(rate)
    }
  }

  private let queue = DispatchQueue(label: "com.swmansion.pulsar.SeekablePatternPlayer")
  private let isHardwareSupported = CHHapticEngine.capabilitiesForHardware().supportsHaptics
  private var patterns: [CHHapticPattern] = []
  private var engine: CHHapticEngine?
  private var players: [CHHapticAdvancedPatternPlayer] = []
  private var playerStartTime: TimeInterval?
  private var timeline: Timeline?
  private var isHapticsEnabled: Bool
  private var errorHandler: (@Sendable (Error) -> Void)?
  private var appStateObservers: [NSObjectProtocol] = []

  init(isHapticsEnabled: Bool) {
    self.isHapticsEnabled = isHapticsEnabled
    super.init()
    appStateObservers = [
      observeAppState(UIApplication.didEnterBackgroundNotification) { $0.pauseAndForgetTimeline() },
      observeAppState(UIApplication.didBecomeActiveNotification) { $0.resumeOutput() }
    ]
  }

  deinit {
    appStateObservers.forEach { NotificationCenter.default.removeObserver($0) }
    players.forEach { try? $0.cancel() }
    Self.stop(engine)
  }

  private func observeAppState(
    _ name: Notification.Name,
    _ action: @escaping @Sendable (SeekablePatternPlayer) -> Void
  ) -> NSObjectProtocol {
    NotificationCenter.default.addObserver(forName: name, object: nil, queue: nil) { [weak self] _ in
      self?.queue.async { [weak self] in
        guard let self else { return }
        action(self)
      }
    }
  }
}

public extension SeekablePatternPlayer {

  @objc func prepare(_ data: PatternData) {
    queue.async { [self] in
      timeline = nil
      cancelPlayers()
      do {
        patterns = try Self.makePatterns(data)
      } catch {
        patterns = []
        report(error)
        return
      }
      prepareQuietly()
    }
  }

  @objc func play(fromMs: Double, rate: Float, atHostTime hostTime: TimeInterval) {
    queue.async { [self] in
      guard rate > 0 else {
        pauseAndForgetTimeline()
        return
      }
      timeline = Timeline(startPosition: fromMs / 1000, rate: rate, hostTime: hostTime)
      startOutput()
    }
  }

  @objc func pause() {
    queue.async { [self] in
      pauseAndForgetTimeline()
    }
  }

  @objc func dispose() {
    queue.async { [self] in
      timeline = nil
      releaseEngine()
      patterns = []
      errorHandler = nil
    }
  }

  @objc func setErrorHandler(_ handler: (@Sendable (Error) -> Void)?) {
    queue.async { [self] in
      errorHandler = handler
    }
  }
}

extension SeekablePatternPlayer {

  func shutDown() {
    queue.async { [self] in
      timeline = nil
      releaseEngine()
    }
  }

  func setHapticsEnabled(_ state: Bool) {
    queue.async { [self] in
      isHapticsEnabled = state
      guard state else {
        releaseEngine()
        return
      }
      if timeline == nil {
        prepareQuietly()
      } else {
        resumeOutput()
      }
    }
  }

  func waitForPendingWork() {
    queue.sync {}
  }
}

private extension SeekablePatternPlayer {

  var canPlay: Bool {
    isHapticsEnabled && isHardwareSupported
  }

  var isStartPending: Bool {
    playerStartTime.map { $0 > CACurrentMediaTime() } ?? false
  }

  func startOutput() {
    guard let timeline, canPlay else { return }
    do {
      var (engine, prepared) = try preparedPlayers()
      if isStartPending {
        cancelPlayers()
        (engine, prepared) = try preparedPlayers()
      } else if playerStartTime != nil {
        try prepared.forEach { try $0.pause(atTime: CHHapticTimeImmediate) }
      }
      var startTime = max(timeline.hostTime, CACurrentMediaTime() + Self.schedulingMargin)
      var position = timeline.position(at: startTime)
      if position < 0 {
        startTime -= position / TimeInterval(timeline.rate)
        position = 0
      }
      let engineStartTime = startTime + engine.currentTime - CACurrentMediaTime()
      for player in prepared {
        player.playbackRate = timeline.rate
        try player.seek(toOffset: position)
        try player.resume(atTime: engineStartTime)
      }
      playerStartTime = startTime
    } catch {
      cancelPlayers()
      report(error)
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
      report(error)
    }
  }

  func resumeOutput() {
    guard timeline != nil, playerStartTime == nil else { return }
    startOutput()
  }

  func pauseAndForgetTimeline() {
    timeline = nil
    stopOutput()
  }

  func report(_ error: Error) {
    if let errorHandler {
      errorHandler(error)
    } else {
      print("SeekablePatternPlayer: \(error.localizedDescription)")
    }
  }
}

private extension SeekablePatternPlayer {

  func preparedPlayers() throws -> (CHHapticEngine, [CHHapticAdvancedPatternPlayer]) {
    if let engine, !players.isEmpty { return (engine, players) }
    guard !patterns.isEmpty else { throw SeekablePatternPlayerError.notPrepared }

    let engine = try engine ?? makeEngine()
    try engine.start()
    let prepared = try patterns.map { try engine.makeAdvancedPlayer(with: $0) }
    for player in prepared {
      player.completionHandler = { [weak self, weak player] error in
        self?.queue.async { [weak self, weak player] in
          guard let self, let player, error == nil else { return }
          self.playerFinished(player)
        }
      }
      try player.start(atTime: CHHapticTimeImmediate)
      try player.pause(atTime: CHHapticTimeImmediate)
    }
    players = prepared
    playerStartTime = nil
    return (engine, prepared)
  }

  func prepareQuietly() {
    guard canPlay, !patterns.isEmpty else { return }
    do {
      _ = try preparedPlayers()
    } catch {
      report(error)
    }
  }

  func makeEngine() throws -> CHHapticEngine {
    let engine = try CHHapticEngine()
    engine.playsHapticsOnly = true
    engine.stoppedHandler = { [weak self, weak engine] _ in
      self?.queue.async { [weak self, weak engine] in
        guard let self, let engine, self.engine === engine else { return }
        self.engineStopped()
      }
    }
    engine.resetHandler = { [weak self, weak engine] in
      self?.queue.async { [weak self, weak engine] in
        guard let self, let engine, self.engine === engine else { return }
        self.engineReset()
      }
    }
    self.engine = engine
    return engine
  }

  static func stop(_ engine: CHHapticEngine?) {
    guard let engine else { return }
    engine.stoppedHandler = { _ in }
    engine.resetHandler = {}
    engine.stop { error in
      withExtendedLifetime(engine) {}
      if let error {
        print("SeekablePatternPlayer: \(error.localizedDescription)")
      }
    }
  }

  func releaseEngine() {
    cancelPlayers()
    Self.stop(engine)
    engine = nil
  }

  func engineStopped() {
    cancelPlayers()
    resumeOutput()
  }

  func engineReset() {
    cancelPlayers()
    if timeline == nil {
      prepareQuietly()
    } else {
      resumeOutput()
    }
  }

  func cancelPlayers() {
    players.forEach { try? $0.cancel() }
    players = []
    playerStartTime = nil
  }

  func playerFinished(_ player: CHHapticAdvancedPatternPlayer) {
    guard players.contains(where: { $0 === player }) else { return }
    timeline = nil
    cancelPlayers()
  }
}

extension SeekablePatternPlayer {

  static func makePatterns(_ data: PatternData) throws -> [CHHapticPattern] {
    let endMarker = CHHapticEvent(
      eventType: .hapticTransient,
      parameters: [CHHapticEventParameter(parameterID: .hapticIntensity, value: 0)],
      relativeTime: PatternSeek.lastTimestamp(of: data) / 1000
    )
    var taps = DiscreteLine()
    for point in data.discretePattern {
      taps.addEvent(timestamp: point.time, intensity: point.amplitude, sharpness: point.frequency)
    }
    var patterns = [try CHHapticPattern(events: taps.getEvents + [endMarker], parameters: [])]

    let amplitude = data.continuousPattern.amplitude
    let frequency = data.continuousPattern.frequency
    let pieces = makeContinuousEvents(amplitude: amplitude, frequency: frequency)
    if !pieces.isEmpty {
      let curves = makeCurves(.hapticIntensityControl, amplitude) + makeCurves(.hapticSharpnessControl, frequency)
      patterns.append(try CHHapticPattern(events: pieces + [endMarker], parameterCurves: curves))
    }
    return patterns
  }

  static func makeContinuousEvents(amplitude: [ValuePoint], frequency: [ValuePoint]) -> [CHHapticEvent] {
    guard !amplitude.isEmpty, !frequency.isEmpty else { return [] }

    let end = max(amplitude.map(\.time).max() ?? 0, frequency.map(\.time).max() ?? 0)
    return rumbles(in: amplitude, endingAt: end).flatMap { rumble in
      let stretch = (rumble.stop - rumble.start) / 1000
      let count = Int((stretch / maxPieceDuration).rounded(.up))
      let duration = stretch / Double(count)
      return (0..<count).map { index in
        CHHapticEvent(
          eventType: .hapticContinuous,
          parameters: [
            CHHapticEventParameter(parameterID: .hapticIntensity, value: 1),
            CHHapticEventParameter(parameterID: .hapticSharpness, value: 0)
          ],
          relativeTime: rumble.start / 1000 + Double(index) * duration,
          duration: duration
        )
      }
    }
  }

  private static func rumbles(in amplitude: [ValuePoint], endingAt end: Double) -> [(start: Double, stop: Double)] {
    var rumbles: [(start: Double, stop: Double)] = []
    var lastSilence = 0.0
    var rumbleStart: Double?
    for point in amplitude {
      if point.value > 0 {
        rumbleStart = rumbleStart ?? lastSilence
        continue
      }
      if let start = rumbleStart {
        rumbles.append((start, point.time))
        rumbleStart = nil
      }
      lastSilence = point.time
    }
    if let start = rumbleStart {
      rumbles.append((start, end))
    }
    return rumbles.filter { $0.stop > $0.start }
  }

  static func makeCurves(_ parameter: CHHapticDynamicParameter.ID, _ points: [ValuePoint]) -> [CHHapticParameterCurve] {
    let line = CurveLineModifier()
    points.forEach { line.addPoint(time: $0.time, value: $0.value) }
    let controlPoints = line.points
    guard !controlPoints.isEmpty else { return [] }

    var curves: [CHHapticParameterCurve] = []
    var index = 0
    repeat {
      let chunk = controlPoints[index..<min(index + maxCurvePoints, controlPoints.count)]
      let curveStart = chunk[chunk.startIndex].relativeTime
      curves.append(
        CHHapticParameterCurve(
          parameterID: parameter,
          controlPoints: chunk.map {
            CHHapticParameterCurve.ControlPoint(relativeTime: $0.relativeTime - curveStart, value: $0.value)
          },
          relativeTime: curveStart
        )
      )
      index = chunk.endIndex - 1
    } while index < controlPoints.count - 1
    return curves
  }
}

final class SeekablePatternPlayerRegistry: @unchecked Sendable {
  private let lock = NSLock()
  private let players = NSHashTable<SeekablePatternPlayer>.weakObjects()
  private var isHapticsEnabled = true

  func makePlayer() -> SeekablePatternPlayer {
    withLock {
      let player = SeekablePatternPlayer(isHapticsEnabled: isHapticsEnabled)
      players.add(player)
      return player
    }
  }

  func setHapticsEnabled(_ state: Bool) {
    withLock {
      isHapticsEnabled = state
      players.allObjects.forEach { $0.setHapticsEnabled(state) }
    }
  }

  func pauseAll() {
    withLock { players.allObjects.forEach { $0.pause() } }
  }

  func shutDownAll() {
    withLock { players.allObjects.forEach { $0.shutDown() } }
  }

  private func withLock<T>(_ body: () -> T) -> T {
    lock.lock()
    defer { lock.unlock() }
    return body()
  }
}
