import CoreHaptics


public struct DiscreteLine {
  private var events: [CHHapticEvent] = []
  
  public var getEvents: [CHHapticEvent] {
    return events
  }
  
  public mutating func addEvent(timestamp: Double, intensity: Float = 1, sharpness: Float = 1) {
    let event = CHHapticEvent(
      eventType: .hapticTransient,
      parameters: [
        CHHapticEventParameter(parameterID: .hapticIntensity, value: intensity),
        CHHapticEventParameter(parameterID: .hapticSharpness, value: sharpness)
      ],
      relativeTime: timestamp,
    )
    events.append(event)
  }
  
  public mutating func reset() {
    events.removeAll()
  }
}
