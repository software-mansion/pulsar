import CoreHaptics


public class CurveLineModifier {
  var points: [CHHapticParameterCurve.ControlPoint] = []
  var maxTime: Double = 0
  
  public func addPoint(time: Double, value: Float) {
    points.append(
      CHHapticParameterCurve.ControlPoint(relativeTime: time, value: value)
    )
    if time > maxTime {
      maxTime = time
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
