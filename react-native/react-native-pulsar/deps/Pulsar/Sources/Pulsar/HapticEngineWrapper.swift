import Foundation
import CoreHaptics
import SwiftUI

public class HapticEngineWrapper {

  private struct PlayerEntry {
    let player: CHHapticPatternPlayer
    let isRealtime: Bool
  }

  private var engine: CHHapticEngine?
  private var initialized: Bool = false
  private var isHapticsEnabled: Bool = true
  private var playerRegistry: [Int: PlayerEntry] = [:]
  private var playerCreationOrder: [Int] = []
  private let playerLimit = 20
  private var nextPlayerId: Int = 0
  private var cachedRealtimePlayer: CHHapticAdvancedPatternPlayer?

  public init() {
    guard CHHapticEngine.capabilitiesForHardware().supportsHaptics else {
      print("Error: Device doesn't support haptics")
      return
    }

    do {
      engine = try CHHapticEngine()
      setupEngineHandlers()
      startEngine()

      NotificationCenter.default.addObserver(
        self,
        selector: #selector(appDidBecomeInactive),
        name: UIApplication.didEnterBackgroundNotification,
        object: nil
      )
      NotificationCenter.default.addObserver(
        self,
        selector: #selector(appWillEnterForeground),
        name: UIApplication.willEnterForegroundNotification,
        object: nil
      )
    } catch {
        print("Error starting engine: \(error.localizedDescription)")
    }
  }

  deinit {
    if !initialized { return }
    engine?.stop()
  }

  public func enableHaptics(_ state: Bool) {
    if (isHapticsEnabled != state) {
      isHapticsEnabled = state

      if (!isHapticsEnabled) {
        stopHaptics()
      } else {
        if !initialized {
          startEngine()
        }
      }
    }
  }

  public func stopHaptics() {
    if !initialized { return }
    engine?.stop()
    initialized = false
  }

  public func shutDownEngine() {
    stopHaptics()
    engine = nil
  }

  private func startEngine() {
    if initialized { return }
    do {
      if engine == nil {
        engine = try CHHapticEngine()
        setupEngineHandlers()
      }
      try engine?.start()
      initialized = true
    } catch {
      print("Error starting engine: \(error.localizedDescription)")
      engine = nil  // Force fresh creation on next attempt
    }
  }

  private func setupEngineHandlers() {
    engine?.stoppedHandler = { [weak self] reason in
      guard let self else { return }
      self.initialized = false
      self.playerRegistry.removeAll()
      self.playerCreationOrder.removeAll()
      self.cachedRealtimePlayer = nil
    }
    engine?.resetHandler = { [weak self] in
      guard let self else { return }
      self.initialized = false
      self.engine = nil
    }
  }

  @objc func appDidBecomeInactive() {
    initialized = false
    engine?.stop()
    for entry in playerRegistry.values {
      try? entry.player.stop(atTime: 0)
    }
    playerRegistry.removeAll()
    playerCreationOrder.removeAll()
    try? cachedRealtimePlayer?.stop(atTime: 0)
    cachedRealtimePlayer = nil
  }

  @objc func appWillEnterForeground() {
    engine = nil
    startEngine()
  }

  public func createPlayer(pattern: CHHapticPattern?) -> Int? {
    startEngine()
    guard let player = buildPatternPlayer(pattern: pattern) else { return nil }
    return registerPlayer(player, isRealtime: false)
  }

  private func buildPatternPlayer(pattern: CHHapticPattern?) -> CHHapticPatternPlayer? {
    do {
      return try engine?.makePlayer(with: pattern ?? CHHapticPattern(events: [], parameters: []))
    } catch {
      print("Error making pattern: \(error.localizedDescription)")
      return nil
    }
  }

  public func getRealtimePlayer() -> CHHapticAdvancedPatternPlayer? {
    startEngine()
    if let player = cachedRealtimePlayer { return player }
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
      cachedRealtimePlayer = try engine?.makeAdvancedPlayer(with: pattern)
      return cachedRealtimePlayer
    } catch {
      print("Error creating realtime player: \(error.localizedDescription)")
      return nil
    }
  }


  public func playPlayer(id: Int, pattern: CHHapticPattern? = nil) {
    if let entry = playerRegistry[id] {
      do {
        try entry.player.start(atTime: 0)
      } catch {
        print("Error starting player: \(error.localizedDescription)")
      }
    } else if let pattern = pattern {
      // Player was evicted — recreate and re-register under the same ID
      startEngine()
      guard let player = buildPatternPlayer(pattern: pattern) else { return }
      evictOldestPlayerIfNeeded()
      playerRegistry[id] = PlayerEntry(player: player, isRealtime: false)
      playerCreationOrder.append(id)
      do {
        try player.start(atTime: 0)
      } catch {
        print("Error starting recreated player: \(error.localizedDescription)")
      }
    }
  }

  public func stopPlayer(id: Int) {
    guard let entry = playerRegistry[id] else { return }
    do {
      try entry.player.stop(atTime: 0)
    } catch {
      print("Error stopping player: \(error.localizedDescription)")
    }
  }


  public func removePlayer(id: Int) {
    if let entry = playerRegistry[id] {
      try? entry.player.stop(atTime: 0)
    }
    playerRegistry.removeValue(forKey: id)
    playerCreationOrder.removeAll { $0 == id }
  }

  private func registerPlayer(_ player: CHHapticPatternPlayer, isRealtime: Bool) -> Int {
    evictOldestPlayerIfNeeded()
    let id = nextPlayerId
    nextPlayerId += 1
    playerRegistry[id] = PlayerEntry(player: player, isRealtime: isRealtime)
    playerCreationOrder.append(id)
    return id
  }

  private func evictOldestPlayerIfNeeded() {
    guard playerRegistry.count >= playerLimit else { return }
    let oldestId = playerCreationOrder.removeFirst()
    if let entry = playerRegistry[oldestId] {
      try? entry.player.stop(atTime: 0)
    }
    playerRegistry.removeValue(forKey: oldestId)
  }

  func isHapticsSupported() -> Bool {
    return CHHapticEngine.capabilitiesForHardware().supportsHaptics
  }

}
