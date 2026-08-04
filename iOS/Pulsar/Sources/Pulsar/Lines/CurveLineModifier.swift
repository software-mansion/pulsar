import CoreHaptics


public class CurveLineModifier {
  var points: [CHHapticParameterCurve.ControlPoint] = []
  var maxTime: Double = 0
  
  /// Adds a control point to the curve
  /// - Parameters:
  ///   - time: Time in milliseconds (ms)
  ///   - value: Normalized value (0.0 - 1.0)
  public func addPoint(time: Double, value: Float) {
    let clampedValue = min(max(value, 0), 1)
    let timeInSeconds = time / 1000.0
    if points.isEmpty && timeInSeconds > 0 {
      points.append(
        CHHapticParameterCurve.ControlPoint(relativeTime: 0, value: clampedValue)
      )
    }
    points.append(
      CHHapticParameterCurve.ControlPoint(relativeTime: timeInSeconds, value: clampedValue)
    )
    if timeInSeconds > maxTime {
      maxTime = timeInSeconds
    }
  }
  
  public func getDuration() -> Double {
    return maxTime
  }
  
  public func reset() {
    points.removeAll()
    maxTime = 0
  }
  
  public var isEmpty: Bool {
    return points.isEmpty
  }
}
