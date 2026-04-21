package com.swmansion.pulsar.haptics

import com.swmansion.pulsar.types.ControlPoint
import com.swmansion.pulsar.types.ConfigPoint

class ControlLineBuilder(val configLine: ConfigLineBuilder) {

    fun getStepsPoints(): ArrayList<ControlPoint> {
        val points = ArrayList<ControlPoint>()
        /*
            This variable is determined empirically. If the transition time is too wide,
            the transition will be nearly imperceptible. Conversely, if the transition is too short,
            the internal LRA cannot keep up due to its own minimum transition time; as a result,
            the haptic effect lasts longer than intended.
        */
        val stepsPerSecond = 13L

        val stepDurationMs = 1000L / stepsPerSecond

        val maxTime = if (configLine.points.isEmpty()) { 0L } else configLine.points.maxOf { it.time }

        var currentTime = 0L
        while (currentTime < maxTime) {
            val nextTime = minOf(currentTime + stepDurationMs, maxTime)
            val duration = maxOf(1L, (nextTime - currentTime))

            val configPoint = averageConfigPoint(currentTime, nextTime, configLine)
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

    private fun averageConfigPoint(startTime: Long, endTime: Long, configLine: ConfigLineBuilder): ConfigPoint {
        if (endTime <= startTime) {
            return interpolateConfigPoint(startTime, configLine)
        }

        val boundaryTimes = ArrayList<Long>()
        boundaryTimes.add(startTime)
        configLine.points.forEach { point ->
            if (point.time > startTime && point.time < endTime) {
                boundaryTimes.add(point.time)
            }
        }
        boundaryTimes.add(endTime)

        var weightedAmplitudeSum = 0f
        var weightedFrequencySum = 0f
        var totalDuration = 0L

        for (i in 0 until boundaryTimes.lastIndex) {
            val segmentStart = boundaryTimes[i]
            val segmentEnd = boundaryTimes[i + 1]
            val segmentDuration = segmentEnd - segmentStart
            if (segmentDuration <= 0L) continue

            val startPoint = interpolateConfigPoint(segmentStart, configLine)
            val endPoint = interpolateConfigPoint(segmentEnd, configLine)

            weightedAmplitudeSum += ((startPoint.amplitude + endPoint.amplitude) / 2f) * segmentDuration
            weightedFrequencySum += ((startPoint.frequency + endPoint.frequency) / 2f) * segmentDuration
            totalDuration += segmentDuration
        }

        if (totalDuration <= 0L) {
            return interpolateConfigPoint(startTime, configLine)
        }

        return ConfigPoint(
            time = startTime,
            amplitude = weightedAmplitudeSum / totalDuration,
            frequency = weightedFrequencySum / totalDuration,
        )
    }
}
