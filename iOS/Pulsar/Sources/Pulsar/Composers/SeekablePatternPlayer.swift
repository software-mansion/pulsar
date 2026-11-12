import Foundation
import CoreHaptics
import QuartzCore
import UIKit

/// Plays a pattern in time with another clock, such as a video's. The pattern is parsed once, and each `play` call says
/// where it should be: at `fromMs` at host time `hostTime`, going at `rate`. Calling `play` again while it plays is a
/// seek, a resume or a rate change in place, without parsing the pattern again.
///
/// `CHHapticAdvancedPatternPlayer` gives no output for a continuous event it seeks, starts or resumes inside, and Core
/// Haptics plays a continuous event for at most 30 s. So the continuous layer becomes back-to-back events of at most
/// 50 ms, each holding the curves' values at its middle, and a seek misses at most one of them. Parameter curves would
/// also scale the discrete events in the same pattern, so the values go into the events instead.
///
/// The player has its own engine, so presets and the realtime composer can't stop it or take its place. When the engine
/// stops or resets, or the app comes back to the foreground, it picks up where the pattern should be by then. It can be
/// called from any thread. It plays no sound.
@objc public final class SeekablePatternPlayer: NSObject, @unchecked Sendable {
  // `@unchecked Sendable` is justified: all stored state is read and written on `queue`. Public methods wait for it,
  // and engine, player and notification callbacks hop onto it.

  /// How far ahead a start is scheduled at the least, so the engine has the command before it's due.
  static let schedulingMargin: TimeInterval = 0.01
  /// The longest continuous event, in seconds.
  static let maxEventDuration: TimeInterval = 0.05
  /// Shorter stretches of the amplitude curve get no event, in milliseconds. Pulsar Studio draws hard edges as 1 ms
  /// steps.
  static let minimumStretch: Double = 10
  /// Weaker continuous events are left out.
  static let minimumIntensity: Float = 0.01

  /// Where the pattern should be: at host time `hostTime` it's `offset` seconds in, going at `rate`.
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
  /// When the player was last set to resume, until it's paused.
  private var playerStartTime: TimeInterval?
  /// Nil while paused.
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

  /// Parses `data` and gets the engine and player ready, so the first `play` costs no more than later ones. Stops what
  /// played before.
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

  /// Plays from `fromMs` into the pattern at host time `hostTime`, on the `CACurrentMediaTime()` clock, going at `rate`.
  /// A host time that has passed, or is too soon to make, starts as soon as possible at the point the pattern should
  /// have reached by then. A rate of 0 or less pauses.
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

  /// Stops at once, together with a start that's still to come. `play` can pick up from anywhere afterwards.
  @objc func pause() {
    queue.sync {
      timeline = nil
      stopOutput()
    }
  }

  /// Stops and lets go of the engine and the pattern. `prepare` makes the player usable again.
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

  /// Turned off, the player stays silent but keeps its place, and turned back on it plays from where the pattern
  /// should be by then.
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

  /// Seeks the player to where the timeline is at the start time and resumes it then.
  func startOutput() {
    guard let timeline, isHapticsEnabled else { return }
    do {
      // Starting the engine and making a player can take tens of milliseconds, so the start is worked out after.
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
        // The pattern hasn't begun by then.
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

  /// Plays again when the timeline says the pattern is playing but the player isn't.
  func resumeOutput() {
    guard timeline != nil, playerStartTime == nil else { return }
    startOutput()
  }

  var isStartPending: Bool {
    playerStartTime.map { $0 > CACurrentMediaTime() } ?? false
  }

  /// The engine clock matches the host clock on the devices measured so far, but this doesn't depend on it.
  func engineTime(forHostTime hostTime: TimeInterval) -> TimeInterval {
    guard let engine else { return CHHapticTimeImmediate }
    return hostTime + engine.currentTime - CACurrentMediaTime()
  }
}

// MARK: - Engine and Player

private extension SeekablePatternPlayer {

  /// A player that has started and paused, so that every play is a seek plus resume. The engine stops its players when
  /// it stops or resets, and a player that has played to its end can't resume, so those get a new one.
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

  /// Stops the player and everything scheduled on it.
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

  /// One pattern that can be sought anywhere: the discrete events, plus the continuous layer as back-to-back events of
  /// at most `maxEventDuration`, each holding the curves' values at its middle.
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

  /// Covers what `PatternComposer` plays: nothing unless both curves have points, otherwise from zero to the last point
  /// of either, each curve holding its first and last values outside its points. Events start and end on the amplitude
  /// curve's points, so its hard edges stay sharp.
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
