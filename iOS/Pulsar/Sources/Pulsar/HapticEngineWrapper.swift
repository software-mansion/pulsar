import Foundation
import CoreHaptics
import SwiftUI

public final class HapticEngineWrapper: @unchecked Sendable {
  // `@unchecked Sendable` is justified: all stored state is mutated only on
  // the main thread (see `setupEngineHandlers()` comment for details). The
  // conformance lets us capture `self` into the main-actor closures used to
  // serialize CoreHaptics callbacks back onto the main thread.
  private var engine: CHHapticEngine?
  private var initialized = false
  private(set) var isHapticsEnabled = true
  private var isAppActiveCache = false
  private var appLifecycleTrackingBootstrapped = false
  private var playerRegistry: [Int: CHHapticPatternPlayer] = [:]
  private var playerCreationOrder: [Int] = []
  private let playerLimit = 20
  private var nextPlayerId = 0
  private var cachedRealtimePlayer: CHHapticAdvancedPatternPlayer?
  // `CHHapticEngine()` and `start()` can block for seconds (e.g. when the haptic
  // server is slow to answer), so they run on this queue instead of the main thread.
  private let engineQueue = DispatchQueue(label: "com.swmansion.pulsar.engine", qos: .userInitiated)
  // The start in flight, if any. Cleared on stop, so that a start which finishes
  // afterwards is discarded.
  private var pendingStart: PendingEngineStart?

  public init() {}

  deinit {
    if !initialized { return }
    engine?.stop()
  }
}

// MARK: - Public API

public extension HapticEngineWrapper {

  func enableHaptics(_ state: Bool) {
    guard isHapticsEnabled != state else { return }

    isHapticsEnabled = state

    if !isHapticsEnabled {
      stopHaptics()
    } else {
      bootstrapAppLifecycleTrackingIfNeeded()
      if canPlayHaptics() && !initialized {
        startEngine()
      }
    }
  }

  func stopHaptics() {
    clearPlayerState(stopPlayers: true)
    engine?.stop()
    initialized = false
    pendingStart = nil
  }

  func shutDownEngine() {
    stopHaptics()
    engine = nil
  }

  func createPlayer(pattern: CHHapticPattern?) -> Int? {
    bootstrapAppLifecycleTrackingIfNeeded()
    guard canPlayHaptics() else { return nil }

    startEngine()
    // While the engine is still starting, hand out an id without a player.
    // `playPlayer(id:pattern:)` builds the player from the pattern on first play.
    guard initialized else { return reservePlayerId() }
    guard let player = buildPatternPlayer(pattern: pattern) else { return nil }

    return registerPlayer(player)
  }

  func registerAudioResource(url: URL) -> CHHapticAudioResourceID? {
    bootstrapAppLifecycleTrackingIfNeeded()
    guard canPlayHaptics() else { return nil }

    startEngine()
    // A pattern with sound is built once, so wait for the engine rather than drop the sound.
    waitForPendingStart()
    do {
      return try runningEngine?.registerAudioResource(url, options: [:])
    } catch {
      print("Error registering audio resource: \(error.localizedDescription)")
      return nil
    }
  }

  func unregisterAudioResource(_ id: CHHapticAudioResourceID) {
    do {
      try engine?.unregisterAudioResource(id)
    } catch {
      print("Error unregistering audio resource: \(error.localizedDescription)")
    }
  }

  func getRealtimePlayer() -> CHHapticAdvancedPatternPlayer? {
    bootstrapAppLifecycleTrackingIfNeeded()
    guard canPlayHaptics() else { return nil }

    startEngine()
    if let player = cachedRealtimePlayer {
      return player
    }

    let player = makeRealtimePlayer()
    cachedRealtimePlayer = player
    return player
  }

  func playPlayer(id: Int, pattern: CHHapticPattern? = nil) {
    bootstrapAppLifecycleTrackingIfNeeded()
    guard canPlayHaptics() else { return }

    if let player = playerRegistry[id] {
      startPlayer(player, errorPrefix: "Error starting player")
      return
    }

    guard let pattern else { return }

    startEngine()
    guard let player = buildPatternPlayer(pattern: pattern) else { return }

    registerRecreatedPlayer(player, for: id)
    startPlayer(player, errorPrefix: "Error starting recreated player")
  }

  func stopPlayer(id: Int) {
    guard let player = playerRegistry[id] else { return }
    stopPlayer(player, errorPrefix: "Error stopping player")
    unregisterPlayer(id)
  }

  func removePlayer(id: Int) {
    if let player = playerRegistry[id] {
      try? player.stop(atTime: 0)
    }

    unregisterPlayer(id)
  }
}

// MARK: - Internal State

extension HapticEngineWrapper {

  func updatePlaybackAvailability(for state: UIApplication.State) {
    isAppActiveCache = state == .active
  }

  var isEngineRunning: Bool {
    initialized
  }

  func canPlayHaptics() -> Bool {
    isHapticsEnabled && isAppActive() && isHapticsSupported()
  }

  func isAppActive() -> Bool {
    return isAppActiveCache
  }

  func isHapticsSupported() -> Bool {
    CHHapticEngine.capabilitiesForHardware().supportsHaptics
  }
}

// MARK: - App Lifecycle

private extension HapticEngineWrapper {

  func registerAppLifecycleObservers() {
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(appDidEnterBackground),
      name: UIApplication.didEnterBackgroundNotification,
      object: nil
    )
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(appWillEnterForeground),
      name: UIApplication.willEnterForegroundNotification,
      object: nil
    )
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(appDidBecomeActive),
      name: UIApplication.didBecomeActiveNotification,
      object: nil
    )
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(appWillResignActive),
      name: UIApplication.willResignActiveNotification,
      object: nil
    )
  }

  @objc func appDidEnterBackground() {
    updatePlaybackAvailability(for: .background)
    suspendHaptics()
  }

  @objc func appWillEnterForeground() {
    // UIApplication lifecycle notifications are posted on the main thread.
    let state = MainActor.assumeIsolated { UIApplication.shared.applicationState }
    updatePlaybackAvailability(for: state)
  }

  @objc func appDidBecomeActive() {
    updatePlaybackAvailability(for: .active)
    engine = nil
    startEngine()
  }

  @objc func appWillResignActive() {
    updatePlaybackAvailability(for: .inactive)
    suspendHaptics()
  }

  func suspendHaptics() {
    stopHaptics()
  }
}

// MARK: - Engine Lifecycle

private extension HapticEngineWrapper {

  var runningEngine: CHHapticEngine? {
    initialized ? engine : nil
  }

  func startEngine() {
    guard !initialized, pendingStart == nil, canPlayHaptics() else { return }

    let start = PendingEngineStart(engine: engine)
    pendingStart = start
    engineQueue.async { [weak self] in
      start.run()
      DispatchQueue.main.async { [weak self] in
        self?.finishStartingEngine(start)
      }
    }
  }

  func waitForPendingStart() {
    guard let start = pendingStart else { return }
    engineQueue.sync {}
    finishStartingEngine(start)
  }

  func finishStartingEngine(_ start: PendingEngineStart) {
    guard !start.isFinished, let result = start.result else { return }
    start.isFinished = true

    guard start === pendingStart else {
      // Stopped while starting. Stop the engine again, unless a newer start is reusing it.
      if case .success(let started) = result, started !== engine || pendingStart == nil {
        started.stop()
      }
      return
    }

    pendingStart = nil
    switch result {
    case .success(let started):
      if started !== engine {
        engine = started
        setupEngineHandlers()
      }
      initialized = true
    case .failure(let error):
      print("Error starting engine: \(error.localizedDescription)")
      engine = nil
    }
  }

  func bootstrapAppLifecycleTrackingIfNeeded() {
    guard !appLifecycleTrackingBootstrapped else { return }
    appLifecycleTrackingBootstrapped = true
    seedAppActiveCache()
    registerAppLifecycleObservers()
  }

  func seedAppActiveCache() {
    let read = { MainActor.assumeIsolated { UIApplication.shared.applicationState == .active } }
    isAppActiveCache = Thread.isMainThread ? read() : DispatchQueue.main.sync(execute: read)
  }

  func setupEngineHandlers() {
    // CoreHaptics invokes these handlers from an internal background queue.
    // All other state in this object (engine, initialized, playerRegistry,
    // playerCreationOrder, cachedRealtimePlayer) is read & written from the
    // main thread — public methods run on the RN module's main methodQueue,
    // and UIApplication.* notifications post on main. Hop the handler bodies
    // to main so that all mutations of shared state remain serialized on a
    // single thread; otherwise the BG handler can race with a main-thread
    // call into createPlayer / playPlayer / stopHaptics and crash on a
    // concurrent Dictionary mutation.
    //
    // Use `DispatchQueue.main.async` rather than `Task { @MainActor }` so the
    // handler bodies stay strictly ordered FIFO with the rest of the main
    // queue's work (e.g. RN bridge calls dispatched on `main` from
    // `Haptics.mm`). Capturing `self` into the GCD closure is allowed under
    // Swift 6 because the class is `@unchecked Sendable`; no actor hop is
    // needed because the stored properties touched here are non-isolated.
    engine?.stoppedHandler = { [weak self] _ in
      DispatchQueue.main.async { [weak self] in
        guard let self else { return }
        self.initialized = false
        self.clearPlayerState(stopPlayers: false)
      }
    }

    engine?.resetHandler = { [weak self] in
      DispatchQueue.main.async { [weak self] in
        guard let self else { return }
        self.initialized = false
        self.clearPlayerState(stopPlayers: false)
        self.engine = nil
      }
    }
  }
}

// MARK: - Player Management

private extension HapticEngineWrapper {

  func buildPatternPlayer(pattern: CHHapticPattern?) -> CHHapticPatternPlayer? {
    do {
      return try runningEngine?.makePlayer(with: pattern ?? CHHapticPattern(events: [], parameters: []))
    } catch {
      print("Error making pattern: \(error.localizedDescription)")
      return nil
    }
  }

  func makeRealtimePlayer() -> CHHapticAdvancedPatternPlayer? {
    let intensityParam = CHHapticEventParameter(parameterID: .hapticIntensity, value: 1)
    let sharpnessParam = CHHapticEventParameter(parameterID: .hapticSharpness, value: 0)
    let event = CHHapticEvent(
      eventType: .hapticContinuous,
      parameters: [intensityParam, sharpnessParam],
      relativeTime: 0,
      duration: 100
    )

    do {
      let pattern = try CHHapticPattern(events: [event], parameters: [])
      return try runningEngine?.makeAdvancedPlayer(with: pattern)
    } catch {
      print("Error creating realtime player: \(error.localizedDescription)")
      return nil
    }
  }

  func clearPlayerState(stopPlayers: Bool) {
    if stopPlayers {
      stopAllRegisteredPlayers()
      try? cachedRealtimePlayer?.stop(atTime: 0)
    }

    playerRegistry.removeAll()
    playerCreationOrder.removeAll()
    cachedRealtimePlayer = nil
  }

  func stopAllRegisteredPlayers() {
    for player in playerRegistry.values {
      try? player.stop(atTime: 0)
    }
  }

  func registerPlayer(_ player: CHHapticPatternPlayer) -> Int {
    evictOldestPlayerIfNeeded()

    let id = reservePlayerId()
    playerRegistry[id] = player
    playerCreationOrder.append(id)
    return id
  }

  func reservePlayerId() -> Int {
    let id = nextPlayerId
    nextPlayerId += 1
    return id
  }

  func registerRecreatedPlayer(_ player: CHHapticPatternPlayer, for id: Int) {
    evictOldestPlayerIfNeeded()
    playerRegistry[id] = player
    playerCreationOrder.append(id)
  }

  func unregisterPlayer(_ id: Int) {
    playerRegistry.removeValue(forKey: id)
    playerCreationOrder.removeAll { $0 == id }
  }

  func evictOldestPlayerIfNeeded() {
    guard playerRegistry.count >= playerLimit else { return }

    let oldestId = playerCreationOrder.removeFirst()
    if let player = playerRegistry[oldestId] {
      try? player.stop(atTime: 0)
    }
    playerRegistry.removeValue(forKey: oldestId)
  }
}

// MARK: - Player Playback

private extension HapticEngineWrapper {

  func startPlayer(_ player: CHHapticPatternPlayer, errorPrefix: String) {
    do {
      try player.start(atTime: 0)
    } catch {
      print("\(errorPrefix): \(error.localizedDescription)")
    }
  }

  func stopPlayer(_ player: CHHapticPatternPlayer, errorPrefix: String) {
    do {
      try player.stop(atTime: 0)
    } catch {
      print("\(errorPrefix): \(error.localizedDescription)")
    }
  }
}

/// Creates (if needed) and starts an engine on `engineQueue`. `result` is written
/// there and read on main only after the queue has run `run()`; `isFinished` is
/// only used on main.
private final class PendingEngineStart: @unchecked Sendable {
  private let engine: CHHapticEngine?
  private(set) var result: Result<CHHapticEngine, Error>?
  var isFinished = false

  init(engine: CHHapticEngine?) {
    self.engine = engine
  }

  func run() {
    result = Result {
      let engine = try self.engine ?? CHHapticEngine()
      try engine.start()
      return engine
    }
  }
}
