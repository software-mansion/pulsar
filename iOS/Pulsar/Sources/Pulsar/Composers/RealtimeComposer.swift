import Foundation
import CoreHaptics

public class RealtimeComposer: NSObject {
  private var engine: HapticEngineWrapper!
  private var continuousPlayerId: Int?
  private var isPlaying = false

  public init(engine: HapticEngineWrapper) {
    self.engine = engine
  }

  deinit {
    stop()
  }

  private func start(amplitude: Float = 0.0, frequency: Float = 0.0) {
    guard !isPlaying else { return }
    stop()
    continuousPlayerId = engine?.createRealtimePlayer()
    isPlaying = true
    set(amplitude: amplitude, frequency: frequency)
    if let id = continuousPlayerId { engine?.playPlayer(id: id) }
  }

  @objc public func set(amplitude: Float, frequency: Float) {
    if (!isPlaying) {
      start(amplitude: amplitude, frequency: frequency)
    }
    guard let id = continuousPlayerId, isPlaying,
          let player = engine?.getRealtimePlayer(id: id) else { return }

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
    if let id = continuousPlayerId {
      engine?.stopPlayer(id: id)
      engine?.removePlayer(id: id)
    }
    continuousPlayerId = nil
    isPlaying = false
  }

  @objc public var isActive: Bool {
    return isPlaying
  }

  @objc public func playDiscrete(amplitude: Float = 1.0, frequency: Float = 0.5) {
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
