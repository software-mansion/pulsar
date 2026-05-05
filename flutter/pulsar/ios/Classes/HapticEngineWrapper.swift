import Foundation
import CoreHaptics
import SwiftUI

public class HapticEngineWrapper {
  private var engine: CHHapticEngine?
  private var initialized = false
  private(set) var isHapticsEnabled = true
  private var isAppActive: Bool
  private var playerRegistry: [Int: CHHapticPatternPlayer] = [:]
  private var playerCreationOrder: [Int] = []
  private let playerLimit = 20
  private var nextPlayerId = 0
  private var cachedRealtimePlayer: CHHapticAdvancedPatternPlayer?

  public init() {
    isAppActive = UIApplication.shared.applicationState == .active

    guard CHHapticEngine.capabilitiesForHardware().supportsHaptics else {
      print("Error: Device doesn't support haptics")
      return
    }

    do {
      engine = try CHHapticEngine()
      setupEngineHandlers()
      startEngine()
      registerAppLifecycleObservers()
    } catch {
      print("Error starting engine: \(error.localizedDescription)")
    }
  }

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
    } else if canPlayHaptics() && !initialized {
      startEngine()
    }
  }

  func stopHaptics() {
    clearPlayerState(stopPlayers: true)
    engine?.stop()
    initialized = false
  }

  func shutDownEngine() {
    stopHaptics()
    engine = nil
  }

  func createPlayer(pattern: CHHapticPattern?) -> Int? {
    guard canPlayHaptics() else { return nil }

    startEngine()
    guard let player = buildPatternPlayer(pattern: pattern) else { return nil }

    return registerPlayer(player)
  }

  func getRealtimePlayer() -> CHHapticAdvancedPatternPlayer? {
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
  }

  func removePlayer(id: Int) {
    if let player = playerRegistry[id] {
      try? player.stop(atTime: 0)
    }

    playerRegistry.removeValue(forKey: id)
    playerCreationOrder.removeAll { $0 == id }
  }
}

// MARK: - Internal State

extension HapticEngineWrapper {

  func updatePlaybackAvailability(for state: UIApplication.State) {
    isAppActive = state == .active
  }

  func canPlayHaptics() -> Bool {
    isHapticsEnabled && isAppActive && isHapticsSupported()
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
    updatePlaybackAvailability(for: UIApplication.shared.applicationState)
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

  func startEngine() {
    guard !initialized, canPlayHaptics() else { return }

    do {
      try createEngineIfNeeded()
      try engine?.start()
      initialized = true
    } catch {
      print("Error starting engine: \(error.localizedDescription)")
      engine = nil
    }
  }

  func createEngineIfNeeded() throws {
    guard engine == nil else { return }

    engine = try CHHapticEngine()
    setupEngineHandlers()
  }

  func setupEngineHandlers() {
    engine?.stoppedHandler = { [weak self] _ in
      guard let self else { return }
      self.initialized = false
      self.clearPlayerState(stopPlayers: false)
    }

    engine?.resetHandler = { [weak self] in
      guard let self else { return }
      self.initialized = false
      self.engine = nil
    }
  }
}

// MARK: - Player Management

private extension HapticEngineWrapper {

  func buildPatternPlayer(pattern: CHHapticPattern?) -> CHHapticPatternPlayer? {
    do {
      return try engine?.makePlayer(with: pattern ?? CHHapticPattern(events: [], parameters: []))
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
      return try engine?.makeAdvancedPlayer(with: pattern)
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

    let id = nextPlayerId
    nextPlayerId += 1
    playerRegistry[id] = player
    playerCreationOrder.append(id)
    return id
  }

  func registerRecreatedPlayer(_ player: CHHapticPatternPlayer, for id: Int) {
    evictOldestPlayerIfNeeded()
    playerRegistry[id] = player
    playerCreationOrder.append(id)
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
