import CoreHaptics

@available(iOS 13.0, macOS 10.15, *)
public struct ContinuousLine {
  private var events: [CHHapticEvent] = []
  private var currentRelativeTime: Double = 0
  
  public var getEvents: [CHHapticEvent] {
    return events
  }
  
  public mutating func addTrapeze(
    intensity: Float = 1,
    sharpness: Float = 1,
    risingDuration: Float = 1,
    peakingDuration: Float = 1,
    fallingDuration: Float = 1
  ) {
    guard risingDuration > 0 && peakingDuration > 0 && fallingDuration > 0 else { return }
    
    let duration: Double = Double(risingDuration + peakingDuration + fallingDuration)
    let event = CHHapticEvent(
      eventType: .hapticContinuous,
      parameters: [
        CHHapticEventParameter(parameterID: .hapticIntensity, value: intensity),
        CHHapticEventParameter(parameterID: .hapticSharpness, value: sharpness),
        CHHapticEventParameter(parameterID: .attackTime, value: risingDuration),
        CHHapticEventParameter(parameterID: .releaseTime, value: risingDuration + peakingDuration),
        CHHapticEventParameter(parameterID: .decayTime, value: fallingDuration),
      ],
      relativeTime: currentRelativeTime,
      duration: duration
    )
    events.append(event)
    currentRelativeTime += duration
  }
  
  public mutating func addPositiveTriangle(
    intensity: Float = 1,
    sharpness: Float = 1,
    risingDuration: Float = 1,
  ) {
    guard risingDuration > 0 else { return }
    
    let duration: Double = Double(risingDuration)
    let event = CHHapticEvent(
      eventType: .hapticContinuous,
      parameters: [
        CHHapticEventParameter(parameterID: .hapticIntensity, value: intensity),
        CHHapticEventParameter(parameterID: .hapticSharpness, value: sharpness),
        CHHapticEventParameter(parameterID: .attackTime, value: risingDuration),
      ],
      relativeTime: currentRelativeTime,
      duration: duration
    )
    events.append(event)
    currentRelativeTime += duration
  }
  
  public mutating func addNegativeTriangle(
    intensity: Float = 1,
    sharpness: Float = 1,
    fallingDuration: Float = 1,
  ) {
    guard fallingDuration > 0 else { return }
    
    let duration: Double = Double(fallingDuration)
    let event = CHHapticEvent(
      eventType: .hapticContinuous,
      parameters: [
        CHHapticEventParameter(parameterID: .hapticIntensity, value: intensity),
        CHHapticEventParameter(parameterID: .hapticSharpness, value: sharpness),
        CHHapticEventParameter(parameterID: .decayTime, value: fallingDuration),
      ],
      relativeTime: currentRelativeTime,
      duration: duration
    )
    events.append(event)
    currentRelativeTime += duration
  }  
  
  public mutating func addSilence(duration: Double) {
    guard duration >= 0 else { return }
    
    currentRelativeTime += duration
  }
}
