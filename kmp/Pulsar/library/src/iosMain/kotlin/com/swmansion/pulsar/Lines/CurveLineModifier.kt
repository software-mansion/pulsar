package com.swmansion.pulsar.kmp

import kotlinx.cinterop.ExperimentalForeignApi
import platform.CoreHaptics.CHHapticParameterCurve
import platform.CoreHaptics.CHHapticParameterCurveControlPoint

@OptIn(ExperimentalForeignApi::class)
internal open class IOSCurveLineModifier(
    private val parameterId: String?,
) {
    private val points = mutableListOf<CHHapticParameterCurveControlPoint>()
    private var maxTime = 0.0

    val isEmpty: Boolean
        get() = points.isEmpty()

    fun addPoint(time: Long, value: Float) {
        val timeInSeconds = time.toDouble() / 1000.0
        if (points.isEmpty() && timeInSeconds > 0.0) {
            points += CHHapticParameterCurveControlPoint(relativeTime = 0.0, value = value)
        }
        points += CHHapticParameterCurveControlPoint(relativeTime = timeInSeconds, value = value)
        if (timeInSeconds > maxTime) {
            maxTime = timeInSeconds
        }
    }

    fun getDuration(): Double = maxTime

    fun reset() {
        points.clear()
        maxTime = 0.0
    }

    val curve: CHHapticParameterCurve
        get() = CHHapticParameterCurve(parameterID = parameterId, controlPoints = points, relativeTime = 0.0)
}
