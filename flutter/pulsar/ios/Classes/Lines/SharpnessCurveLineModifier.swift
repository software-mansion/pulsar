import CoreHaptics


public class SharpnessCurveLineModifier : CurveLineModifier {
  public var getCurve: CHHapticParameterCurve {
    return CHHapticParameterCurve(
      parameterID: .hapticSharpnessControl,
      controlPoints: points,
      relativeTime: 0
    )
  }
}
