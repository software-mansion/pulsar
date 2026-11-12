import Foundation
import CoreHaptics
import QuartzCore
import UIKit

/// Plays a pattern in time with another clock, such as a video's. An advanced player is silent inside a continuous
/// event it seeks into, so the continuous layer is split into events of at most 50 ms with the curve values baked in.
@objc public final class SeekablePatternPlayer: NSObject, @unchecked Sendable {
  // `@unchecked Sendable` is justified: all stored state is read and written on `queue`.

  static let schedulingMargin: TimeInterval = 0.01
  static let maxEventDuration: TimeInterval = 0.05
  /// In milliseconds. Pulsar Studio draws hard edges as 1 ms steps.
  static let minimumStretch: Double = 10
  static let minimumIntensity: Float = 0.01

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
  private var pattern: CHHapticPattern?
  private var engine: CHHapticEngine?
  private var player: CHHapticAdvancedPatternPlayer?
  private var playerStartTime: TimeInterval?
  private var timeline: Timeline?
  private var isHapticsEnabled: Bool
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
    try? player?.cancel()
    engine?.stop()
  }
}

// MARK: - Public API

public extension SeekablePatternPlayer {

  @objc func prepare(_ data: PatternData) {
    queue.sync {
      timeline = nil
      cancelPlayer()
      do {
        pattern = try Self.makePattern(data)
      } catch {
        print("Error parsing seekable pattern: \(error.localizedDescription)")
        pattern = nil
        return
      }
      prepareQuietly()
    }
  }

  /// Plays from `fromMs` at `hostTime` on the `CACurrentMediaTime()` clock. Calling it again while playing seeks,
  /// resumes or changes rate in place. A rate of 0 or less pauses.
  @objc func play(fromMs: Double, rate: Float, atHostTime hostTime: TimeInterval) {
    queue.sync {
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
    queue.sync {
      timeline = nil
      stopOutput()
    }
  }

  @objc func dispose() {
    queue.sync {
      timeline = nil
      cancelPlayer()
      engine?.stop()
      engine = nil
      pattern = nil
    }
  }
}

// MARK: - Internal State

extension SeekablePatternPlayer {

  func setHapticsEnabled(_ state: Bool) {
    queue.sync {
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
      // Making the player can start the engine, so the start time is worked out after.
      var player = try preparedPlayer()
      if isStartPending {
        // Core Haptics doesn't document what a pause or seek does to a resume that's still to come.
        cancelPlayer()
        player = try preparedPlayer()
      } else if playerStartTime != nil {
        try player.pause(atTime: CHHapticTimeImmediate)
      }
      var startTime = max(timeline.hostTime, CACurrentMediaTime() + Self.schedulingMargin)
      var offset = timeline.offset(at: startTime)
      if offset < 0 {
        startTime -= offset / TimeInterval(timeline.rate)
        offset = 0
      }
      player.playbackRate = timeline.rate
      try player.seek(toOffset: offset)
      try player.resume(atTime: engineTime(forHostTime: startTime))
      playerStartTime = startTime
    } catch {
      print("Error playing seekable pattern: \(error.localizedDescription)")
      dropPlayer()
    }
  }

  func stopOutput() {
    guard let player, playerStartTime != nil else { return }
    if isStartPending {
      cancelPlayer()
      prepareQuietly()
      return
    }
    do {
      try player.pause(atTime: CHHapticTimeImmediate)
      playerStartTime = nil
    } catch {
      print("Error pausing seekable pattern: \(error.localizedDescription)")
      dropPlayer()
    }
  }

  func resumeOutput() {
    guard timeline != nil, playerStartTime == nil else { return }
    startOutput()
  }

  var isStartPending: Bool {
    playerStartTime.map { $0 > CACurrentMediaTime() } ?? false
  }

  func engineTime(forHostTime hostTime: TimeInterval) -> TimeInterval {
    guard let engine else { return CHHapticTimeImmediate }
    return hostTime + engine.currentTime - CACurrentMediaTime()
  }
}

// MARK: - Engine and Player

private extension SeekablePatternPlayer {

  /// Started and paused, so that every play is a seek plus resume.
  func preparedPlayer() throws -> CHHapticAdvancedPatternPlayer {
    if let player { return player }
    guard let pattern else { throw PlayerError.notPrepared }

    let engine = try engine ?? makeEngine()
    try engine.start()
    let player = try engine.makeAdvancedPlayer(with: pattern)
    let playerID = ObjectIdentifier(player)
    player.completionHandler = { [weak self] _ in
      self?.queue.async { [weak self] in
        self?.playerFinished(playerID)
      }
    }
    try player.start(atTime: CHHapticTimeImmediate)
    try player.pause(atTime: CHHapticTimeImmediate)
    self.player = player
    playerStartTime = nil
    return player
  }

  func prepareQuietly() {
    do {
      _ = try preparedPlayer()
    } catch {
      print("Error preparing seekable pattern: \(error.localizedDescription)")
    }
  }

  func makeEngine() throws -> CHHapticEngine {
    let engine = try CHHapticEngine()
    engine.playsHapticsOnly = true
    engine.stoppedHandler = { [weak self] reason in
      self?.queue.async { [weak self] in
        self?.engineStopped(reason)
      }
    }
    engine.resetHandler = { [weak self] in
      self?.queue.async { [weak self] in
        self?.engineReset()
      }
    }
    self.engine = engine
    return engine
  }

  func engineStopped(_ reason: CHHapticEngine.StoppedReason) {
    dropPlayer()
    // Haptics can't start in the background, so that waits for the app to become active.
    if reason != .applicationSuspended {
      resumeOutput()
    }
  }

  func engineReset() {
    dropPlayer()
    resumeOutput()
  }

  func cancelPlayer() {
    do {
      try player?.cancel()
    } catch {
      print("Error cancelling seekable pattern: \(error.localizedDescription)")
    }
    dropPlayer()
  }

  func dropPlayer() {
    player = nil
    playerStartTime = nil
  }

  func playerFinished(_ playerID: ObjectIdentifier) {
    guard let player, ObjectIdentifier(player) == playerID else { return }
    timeline = nil
    dropPlayer()
  }
}

// MARK: - Pattern

extension SeekablePatternPlayer {

  static func makePattern(_ data: PatternData) throws -> CHHapticPattern {
    let discreteEvents = data.discretePattern.map { point in
      CHHapticEvent(
        eventType: .hapticTransient,
        parameters: [
          CHHapticEventParameter(parameterID: .hapticIntensity, value: clamped(point.amplitude)),
          CHHapticEventParameter(parameterID: .hapticSharpness, value: clamped(point.frequency))
        ],
        relativeTime: point.time / 1000
      )
    }
    let continuousEvents = makeContinuousEvents(
      amplitude: data.continuousPattern.amplitude,
      frequency: data.continuousPattern.frequency
    )
    return try CHHapticPattern(events: discreteEvents + continuousEvents, parameters: [])
  }

  /// Covers what `PatternComposer` plays. Events start and end on the amplitude curve's points, so its hard edges stay
  /// sharp.
  static func makeContinuousEvents(amplitude: [ValuePoint], frequency: [ValuePoint]) -> [CHHapticEvent] {
    guard !amplitude.isEmpty, !frequency.isEmpty else { return [] }

    let end = max(amplitude.map(\.time).max() ?? 0, frequency.map(\.time).max() ?? 0)
    let edges = [0.0] + amplitude.map(\.time).filter { $0 > 0 && $0 < end } + [end]
    var events: [CHHapticEvent] = []
    for (start, stop) in zip(edges, edges.dropFirst()) where stop - start >= minimumStretch {
      let stretch = (stop - start) / 1000
      let count = Int((stretch / maxEventDuration).rounded(.up))
      let duration = stretch / Double(count)
      for index in 0..<count {
        let eventStart = start / 1000 + Double(index) * duration
        let middle = (eventStart + duration / 2) * 1000
        let intensity = clamped(PatternSeek.interpolatedValue(of: amplitude, at: middle))
        guard intensity > minimumIntensity else { continue }
        events.append(
          CHHapticEvent(
            eventType: .hapticContinuous,
            parameters: [
              CHHapticEventParameter(parameterID: .hapticIntensity, value: intensity),
              CHHapticEventParameter(
                parameterID: .hapticSharpness,
                value: clamped(PatternSeek.interpolatedValue(of: frequency, at: middle))
              )
            ],
            relativeTime: eventStart,
            duration: duration
          )
        )
      }
    }
    return events
  }

  private static func clamped(_ value: Float) -> Float {
    min(max(value, 0), 1)
  }
}
