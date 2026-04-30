package com.swmansion.pulsar.kmp.androidimpl.haptics

import com.swmansion.pulsar.kmp.androidimpl.types.ValuePoint

class ValueLineBuilder(initialList: List<ValuePoint>? = null) {
    var points = ArrayList<ValuePoint>()

    init {
        initialList?.forEach {
            pushPoint(ValuePoint(it.time, it.value))
        }
    }

    fun pushPoint(point: ValuePoint) {
        if (points.isEmpty() || point.time >= points.last().time) {
            points.add(point)
            return
        }
        
        val insertIndex = points.indexOfFirst { it.time > point.time }
        points.add(insertIndex, point)
    }

    fun valueForX(x: Long): Float {
        if (points.isEmpty()) return 0f
        if (points.any { it.time == x }) return points.first { it.time == x }.value
        if (points.size == 1) return points[0].value
        if (x <= points.first().time) return 0f
        if (x >= points.last().time) return 0f

        val nextPointIndex = points.indexOfFirst { it.time > x }
        val prevPoint = points[nextPointIndex - 1]
        val nextPoint = points[nextPointIndex]

        val timeDiff = nextPoint.time - prevPoint.time
        val valueDiff = nextPoint.value - prevPoint.value
        val progress = (x - prevPoint.time).toFloat() / timeDiff

        return prevPoint.value + valueDiff * progress
    }

    fun mergeLine(linePattern: ValueLineBuilder) {
        for (i in 0 until linePattern.points.size step 4) {
            val minTime = linePattern.points[i].time
            val maxTime = linePattern.points[i + 3].time

            points.removeAll { point -> point.time in minTime..maxTime }

            pushPoint(linePattern.points[i])
            pushPoint(linePattern.points[i + 1])
            pushPoint(linePattern.points[i + 2])
            pushPoint(linePattern.points[i + 3])
        }
    }
}