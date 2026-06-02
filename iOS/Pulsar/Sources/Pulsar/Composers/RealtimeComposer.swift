import Foundation
import CoreHaptics

public class RealtimeComposer: NSObject {
  private var engine: HapticEngineWrapper!
  private var isPlaying = false
  /// Sticky "stopped" latch. Once [stop] runs, [set] and [playDiscrete] are
  /// no-ops until [reset] clears it. Load-bearing: a single stray UI-runtime
  /// `set` arriving after the JS-side teardown would otherwise auto-start a
  /// fresh 100-second `CHHapticAdvancedPatternPlayer` with no caller left to
  /// stop it — the user-visible "haptic keeps playing after Back" bug.
  private var isStopped = false
  private let stateLock = NSLock()

  public init(engine: HapticEngineWrapper) {
    self.engine = engine
  }

  deinit {
    stop()
  }

  private func start(amplitude: Float = 0.0, frequency: Float = 0.0) {
    guard !isPlaying else { return }
    guard let player = engine?.getRealtimePlayer() else { return }
    isPlaying = true
    set(amplitude: amplitude, frequency: frequency)
    // Re-check the latch immediately before kicking off the long-lived player:
    // a concurrent stop() could have flipped isStopped between the guard above
    // and here, and player.start would otherwise leave a 100s player running.
    stateLock.lock()
    let stopped = isStopped
    if stopped { isPlaying = false }
    stateLock.unlock()
    if stopped { return }
    do {
      try player.start(atTime: 0)
    } catch {
      print("Error starting realtime player: \(error.localizedDescription)")
    }
  }

  @objc public func set(amplitude: Float, frequency: Float) {
    stateLock.lock()
    let stopped = isStopped
    stateLock.unlock()
    if stopped { return }
    guard engine.isHapticsEnabled else { return }
    if (!isPlaying) {
      start(amplitude: amplitude, frequency: frequency)
    }
    guard isPlaying, let player = engine?.getRealtimePlayer() else { return }

    let parameters = [
      CHHapticDynamicParameter(parameterID: .hapticIntensityControl, value: min(max(amplitude, 0), 1), relativeTime: 0),
      CHHapticDynamicParameter(parameterID: .hapticSharpnessControl, value: min(max(frequency, 0), 1), relativeTime: 0)
    ]
    do {
      try player.sendParameters(parameters, atTime: 0)
    } catch {
      print("Failed to update haptic parameters: \(error)")
    }
  }

  @objc public func stop() {
    stateLock.lock()
    isStopped = true
    let wasPlaying = isPlaying
    isPlaying = false
    stateLock.unlock()
    guard wasPlaying else { return }
    // Use peekRealtimePlayer (side-effect-free) instead of getRealtimePlayer:
    // the latter calls startEngine() + creates a fresh player if there is no
    // cached one, which would re-arm the engine just to stop a player that
    // never existed.
    do {
      try engine?.peekRealtimePlayer()?.stop(atTime: 0)
    } catch {
      print("Error stopping realtime player: \(error.localizedDescription)")
    }
  }

  @objc public var isActive: Bool {
    return isPlaying
  }

  @objc public func resetLatch() {
    stateLock.lock()
    isStopped = false
    stateLock.unlock()
  }

  @objc public func playDiscrete(amplitude: Float = 1.0, frequency: Float = 0.5) {
    stateLock.lock()
    let stopped = isStopped
    stateLock.unlock()
    if stopped { return }
    guard engine.isHapticsEnabled else { return }
    guard CHHapticEngine.capabilitiesForHardware().supportsHaptics else { return }

    let intensityParam = CHHapticEventParameter(parameterID: .hapticIntensity, value: amplitude)
    let sharpnessParam = CHHapticEventParameter(parameterID: .hapticSharpness, value: frequency)
    let event = CHHapticEvent(eventType: .hapticTransient, parameters: [intensityParam, sharpnessParam], relativeTime: 0)

    do {
      let pattern = try CHHapticPattern(events: [event], parameters: [])
      if let id = engine?.createPlayer(pattern: pattern) {
        engine?.playPlayer(id: id, pattern: pattern)
      }
    } catch {
      print("Failed to play transient haptic: \(error)")
    }
  }
}
