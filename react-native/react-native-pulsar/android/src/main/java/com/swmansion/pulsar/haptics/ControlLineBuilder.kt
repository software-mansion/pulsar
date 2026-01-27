package com.swmansion.pulsar.haptics

import com.swmansion.pulsar.types.ControlPoint
import com.swmansion.pulsar.types.ConfigPoint

class ControlLineBuilder(configLine: ConfigLineBuilder) {
    val points = ArrayList<ControlPoint>()

    init {
        val stepsPerSecond = 200

        val stepDurationMs = 1f / stepsPerSecond
        val maxTime = configLine.points.maxOf { it.time }

        var currentTime = 0f
        while (currentTime < maxTime) {
            val nextTime = minOf(currentTime + stepDurationMs, maxTime)
            val duration = maxOf(0.001f, (nextTime - currentTime))

            val configPoint = interpolateConfigPoint(currentTime, configLine)
            points.add(ControlPoint(configPoint.amplitude, configPoint.frequency, duration))
            currentTime = nextTime
        }
    }

    private fun interpolateConfigPoint(time: Float, configLine: ConfigLineBuilder): ConfigPoint {
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
        val progress = (time - prevPoint.time) / timeDiff

        val interpolatedAmplitude = prevPoint.amplitude + amplitudeDiff * progress
        val interpolatedFrequency = prevPoint.frequency + frequencyDiff * progress

        return ConfigPoint(time = time, amplitude = interpolatedAmplitude, frequency = interpolatedFrequency)
    }
}