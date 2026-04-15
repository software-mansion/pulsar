package com.swmansion.pulsar.androidimpl.haptics

import com.swmansion.pulsar.androidimpl.types.ControlPoint
import com.swmansion.pulsar.androidimpl.types.ConfigPoint

class ControlLineBuilder(val configLine: ConfigLineBuilder) {

    fun getStepsPoints(): ArrayList<ControlPoint> {
        val points = ArrayList<ControlPoint>()
        val stepsPerSecond = 200L

        val stepDurationMs = 1000L / stepsPerSecond

        val maxTime = if (configLine.points.isEmpty()) { 0L } else configLine.points.maxOf { it.time }

        var currentTime = 0L
        while (currentTime < maxTime) {
            val nextTime = minOf(currentTime + stepDurationMs, maxTime)
            val duration = maxOf(1L, (nextTime - currentTime))

            val configPoint = interpolateConfigPoint(currentTime, configLine)
            points.add(ControlPoint(configPoint.amplitude, configPoint.frequency, duration))
            currentTime = nextTime
        }
        return points
    }

    fun getLinearPoints(): ArrayList<ControlPoint> {
        val points = ArrayList<ControlPoint>()
        for (i in 0..<configLine.points.size) {
            val point = configLine.points[i]
            var duration = maxOf(1L, point.time)
            if (i > 0) {
                duration = point.time - configLine.points[i - 1].time
            }
            points.add(ControlPoint(point.amplitude, point.frequency, duration))
        }
        return points
    }

    private fun interpolateConfigPoint(time: Long, configLine: ConfigLineBuilder): ConfigPoint {
        if (configLine.points.isEmpty()) return ConfigPoint(time, 0f, 0f)
        if (configLine.points.any { it.time == time }) return configLine.points.first { it.time == time }
        if (configLine.points.size == 1) return configLine.points[0]
        if (time <= configLine.points.first().time) return configLine.points.first()
        if (time >= configLine.points.last().time) return configLine.points.last()

        val nextPointIndex = configLine.points.indexOfFirst { it.time > time }
        val prevPoint = configLine.points[nextPointIndex - 1]
        val nextPoint = configLine.points[nextPointIndex]

        val timeDiff = nextPoint.time - prevPoint.time
        val amplitudeDiff = nextPoint.amplitude - prevPoint.amplitude
        val frequencyDiff = nextPoint.frequency - prevPoint.frequency
        val progress = (time - prevPoint.time).toFloat() / timeDiff

        val interpolatedAmplitude = prevPoint.amplitude + amplitudeDiff * progress
        val interpolatedFrequency = prevPoint.frequency + frequencyDiff * progress

        return ConfigPoint(time = time, amplitude = interpolatedAmplitude, frequency = interpolatedFrequency)
    }
}