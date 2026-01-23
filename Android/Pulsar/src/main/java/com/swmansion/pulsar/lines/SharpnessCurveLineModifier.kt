package com.swmansion.pulsar.lines

import com.swmansion.pulsar.audio.PatternPoint

class SharpnessCurveLineModifier : CurveLineModifier {
    private val points = mutableListOf<PatternPoint>()

    override fun addPoint(time: Double, value: Float) {
        points.add(PatternPoint(time.toFloat(), value.coerceIn(0f, 1f)))
        points.sortBy { it.time }
    }

    override fun reset() {
        points.clear()
    }

    override fun isEmpty(): Boolean = points.isEmpty()

    override fun getDuration(): Double = points.lastOrNull()?.time?.toDouble() ?: 0.0

    override fun getCurve(): List<PatternPoint> = points.toList()
}
