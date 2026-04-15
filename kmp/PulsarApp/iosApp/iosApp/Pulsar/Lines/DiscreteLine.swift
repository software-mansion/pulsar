import CoreHaptics


public struct DiscreteLine {
  private var events: [CHHapticEvent] = []
  
  public var getEvents: [CHHapticEvent] {
    return events
  }
  
  /// Adds a discrete haptic event
  /// - Parameters:
  ///   - timestamp: Time in milliseconds (ms)
  ///   - intensity: Haptic intensity (0.0 - 1.0)
  ///   - sharpness: Haptic sharpness (0.0 - 1.0)
  public mutating func addEvent(timestamp: Double, intensity: Float = 1, sharpness: Float = 1) {
    let event = CHHapticEvent(
      eventType: .hapticTransient,
      parameters: [
        CHHapticEventParameter(parameterID: .hapticIntensity, value: intensity),
        CHHapticEventParameter(parameterID: .hapticSharpness, value: sharpness)
      ],
      relativeTime: timestamp / 1000.0,
    )
    events.append(event)
  }
  
  public mutating func reset() {
    events.removeAll()
  }
}
