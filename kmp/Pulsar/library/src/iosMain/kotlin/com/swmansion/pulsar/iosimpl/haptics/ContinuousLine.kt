package com.swmansion.pulsar.kmp

internal class IOSContinuousLine {
    val intensityCurveLine = IOSIntensityCurveLineModifier()
    val sharpnessCurveLine = IOSSharpnessCurveLineModifier()

    fun reset() {
        intensityCurveLine.reset()
        sharpnessCurveLine.reset()
    }
}
