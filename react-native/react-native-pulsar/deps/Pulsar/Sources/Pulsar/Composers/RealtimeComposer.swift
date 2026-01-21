import Foundation
import CoreHaptics

public class RealtimeComposerImpl: NSObject {
  private var engine: HapticEngineWrapper!
  private var continuousPlayer: CHHapticAdvancedPatternPlayer?
  private var isPlaying = false
  private var initialized = false
  
  public init(engine: HapticEngineWrapper) {
    self.engine = engine
  }
  
  deinit {
    stop()
    initialized = false
  }

  public func start(intensity: Float = 0.5, sharpness: Float = 0.5) {
    guard initialized, !isPlaying else { return }
    
    do {
      continuousPlayer = engine?.getRealtimePlayer()
      isPlaying = true
      update(intensity: intensity, sharpness: sharpness)
      try continuousPlayer?.start(atTime: 0)
      isPlaying = true
    } catch {
      print("Failed to start continuous haptic: \(error)")
    }
  }
  
  public func update(intensity: Float, sharpness: Float) {
    if (!isPlaying) {
      start(intensity: intensity, sharpness: sharpness)
    }
    guard let player = continuousPlayer, isPlaying else { return }
    
    var parameters: [CHHapticDynamicParameter] = []
    
    let clampedIntensity = min(max(intensity, 0), 1)
    parameters.append(CHHapticDynamicParameter(
      parameterID: .hapticIntensityControl,
      value: clampedIntensity,
      relativeTime: 0
    ))
    
    let clampedSharpness = min(max(sharpness, 0), 1)
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
  
  public func stop() {
    guard isPlaying else { return }
    
    do {
      try continuousPlayer?.stop(atTime: 0)
    } catch {
      print("Failed to stop haptic: \(error)")
    }
    
    continuousPlayer = nil
    isPlaying = false
  }
  
  public var isActive: Bool {
    return isPlaying
  }
  
  public func playTransient(intensity: Float = 1.0, sharpness: Float = 0.5) {
    guard CHHapticEngine.capabilitiesForHardware().supportsHaptics else { return }
  
    let intensityParam = CHHapticEventParameter(parameterID: .hapticIntensity, value: intensity)
    let sharpnessParam = CHHapticEventParameter(parameterID: .hapticSharpness, value: sharpness)
    
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

