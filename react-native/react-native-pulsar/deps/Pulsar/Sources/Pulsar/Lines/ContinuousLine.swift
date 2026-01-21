import CoreHaptics


public struct ContinuousLine {
  public var intensityCurveLine = IntensityCurveLineModifier()
  public var sharpnessCurveLine = SharpnessCurveLineModifier()
  
  public mutating func reset() {
    intensityCurveLine.reset()
  }
}
