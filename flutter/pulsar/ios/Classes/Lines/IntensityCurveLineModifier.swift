import CoreHaptics


public class IntensityCurveLineModifier : CurveLineModifier {
  public var getCurve: CHHapticParameterCurve {
    return CHHapticParameterCurve(
      parameterID: .hapticIntensityControl,
      controlPoints: points,
      relativeTime: 0
    )
  }
}
