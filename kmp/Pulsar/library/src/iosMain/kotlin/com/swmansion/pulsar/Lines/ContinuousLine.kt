package com.swmansion.pulsar

internal class IOSContinuousLine {
    val intensityCurveLine = IOSIntensityCurveLineModifier()
    val sharpnessCurveLine = IOSSharpnessCurveLineModifier()

    fun reset() {
        intensityCurveLine.reset()
        sharpnessCurveLine.reset()
    }
}
