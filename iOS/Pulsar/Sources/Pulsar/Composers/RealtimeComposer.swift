import Foundation
import CoreHaptics

public class RealtimeComposer: NSObject {
  private var engine: HapticEngineWrapper!
  private var isPlaying = false

  public init(engine: HapticEngineWrapper) {
    self.engine = engine
  }

  deinit {
    stop()
  }

  @objc public func start() {
    guard engine.isHapticsEnabled else { return }
    guard !isPlaying else { return }
    guard let player = engine?.getRealtimePlayer() else { return }
    isPlaying = true
    do {
      try player.start(atTime: 0)
    } catch {
      isPlaying = false
      print("Error starting realtime player: \(error.localizedDescription)")
    }
  }

  @objc public func set(amplitude: Float, frequency: Float) {
    set(amplitude: amplitude, frequency: frequency, startIfNeeded: false)
  }

  @objc public func set(amplitude: Float, frequency: Float, startIfNeeded: Bool) {
    guard engine.isHapticsEnabled else { return }
    if !isPlaying {
      guard startIfNeeded else { return }
      start()
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
    guard isPlaying else { return }
    do {
      try engine?.getRealtimePlayer()?.stop(atTime: 0)
    } catch {
      print("Error stopping realtime player: \(error.localizedDescription)")
    }
    isPlaying = false
  }

  @objc public var isActive: Bool {
    return isPlaying
  }

  @objc public func playDiscrete(amplitude: Float = 1.0, frequency: Float = 0.5) {
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
