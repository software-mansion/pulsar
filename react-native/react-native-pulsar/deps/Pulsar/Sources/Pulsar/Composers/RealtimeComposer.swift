import Foundation
import CoreHaptics

public class RealtimeComposer: NSObject {
  private var engine: HapticEngineWrapper!
  private var continuousPlayer: CHHapticAdvancedPatternPlayer?
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
    do {
      continuousPlayer = engine?.getRealtimePlayer()
      isPlaying = true
      set(amplitude: amplitude, frequency: frequency)
      try continuousPlayer?.start(atTime: 0)
    } catch {
      print("Failed to start continuous haptic: \(error)")
    }
  }
  
  @objc public func set(amplitude: Float, frequency: Float) {
    if (!isPlaying) {
      start(amplitude: amplitude, frequency: frequency)
    }
    guard let player = continuousPlayer, isPlaying else { return }
    
    var parameters: [CHHapticDynamicParameter] = []
    
    let clampedIntensity = min(max(amplitude, 0), 1)
    parameters.append(CHHapticDynamicParameter(
      parameterID: .hapticIntensityControl,
      value: clampedIntensity,
      relativeTime: 0
    ))
    
    let clampedSharpness = min(max(frequency, 0), 1)
    parameters.append(CHHapticDynamicParameter(
      parameterID: .hapticSharpnessControl,
      value: clampedSharpness,
      relativeTime: 0
    ))
    
    do {
      try player.sendParameters(parameters, atTime: 0)
    } catch {
      print("Failed to update haptic parameters: \(error)")
    }
  }
  
  @objc public func stop() {
    guard isPlaying else { return }
    
    do {
      try continuousPlayer?.stop(atTime: 0)
    } catch {
      print("Failed to stop haptic: \(error)")
    }
    
    continuousPlayer = nil
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
      let player = engine?.getPlayer(pattern: pattern)
      try player?.start(atTime: 0)
    } catch {
      print("Failed to play transient haptic: \(error)")
    }
  }
}

