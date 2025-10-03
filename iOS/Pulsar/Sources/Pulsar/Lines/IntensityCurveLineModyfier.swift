import CoreHaptics

@available(iOS 13.0, macOS 10.15, *)
public class IntensityCurveLineModyfier : CurveLineModyfier {
  public var getCurve: CHHapticParameterCurve {
    return CHHapticParameterCurve(
      parameterID: .hapticIntensityControl,
      controlPoints: points,
      relativeTime: 0
    )
  }
}
