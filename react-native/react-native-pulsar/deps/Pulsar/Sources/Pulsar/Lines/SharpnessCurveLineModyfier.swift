import CoreHaptics

@available(iOS 13.0, macOS 10.15, *)
public class SharpnessCurveLineModyfier : CurveLineModyfier {
  public var getCurve: CHHapticParameterCurve {
    return CHHapticParameterCurve(
      parameterID: .hapticSharpnessControl,
      controlPoints: points,
      relativeTime: 0
    )
  }
}
