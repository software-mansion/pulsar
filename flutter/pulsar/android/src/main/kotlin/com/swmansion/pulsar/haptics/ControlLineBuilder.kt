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
        val configPoints = configLine.points

        val maxTime = if (configPoints.isEmpty()) { 0L } else configPoints.last().time

        var currentTime = 0L
        var segmentIndex = -1
        while (currentTime < maxTime) {
            val nextTime = minOf(currentTime + stepDurationMs, maxTime)
            val duration = maxOf(1L, (nextTime - currentTime))

            var bucketTime = currentTime
            var amplitudeArea = 0f
            var frequencyArea = 0f

            while (bucketTime < nextTime) {
                while (
                    segmentIndex + 1 < configPoints.size &&
                    configPoints[segmentIndex + 1].time <= bucketTime
                ) {
                    segmentIndex++
                }

                val segmentEnd = when {
                    segmentIndex < 0 -> minOf(nextTime, configPoints.first().time)
                    segmentIndex >= configPoints.lastIndex -> nextTime
                    else -> minOf(nextTime, configPoints[segmentIndex + 1].time)
                }

                val segmentDuration = segmentEnd - bucketTime
                if (segmentDuration <= 0L) {
                    bucketTime = segmentEnd
                    continue
                }

                val (averageAmplitude, averageFrequency) = when {
                    segmentIndex < 0 -> {
                        val point = configPoints.first()
                        point.amplitude to point.frequency
                    }
                    segmentIndex >= configPoints.lastIndex -> {
                        val point = configPoints.last()
                        point.amplitude to point.frequency
                    }
                    else -> {
                        val startPoint = configPoints[segmentIndex]
                        val endPoint = configPoints[segmentIndex + 1]
                        averageValuesInSegment(bucketTime, segmentEnd, startPoint, endPoint)
                    }
                }

                amplitudeArea += averageAmplitude * segmentDuration
                frequencyArea += averageFrequency * segmentDuration
                bucketTime = segmentEnd
            }

            points.add(
                ControlPoint(
                    intensity = amplitudeArea / duration,
                    sharpness = frequencyArea / duration,
                    duration = duration,
                )
            )
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

    private fun averageValuesInSegment(
        startTime: Long,
        endTime: Long,
        startPoint: ConfigPoint,
        endPoint: ConfigPoint,
    ): Pair<Float, Float> {
        val timeDiff = endPoint.time - startPoint.time
        if (timeDiff <= 0L) {
            return startPoint.amplitude to startPoint.frequency
        }

        val startProgress = (startTime - startPoint.time).toFloat() / timeDiff
        val endProgress = (endTime - startPoint.time).toFloat() / timeDiff

        val startAmplitude =
            startPoint.amplitude + (endPoint.amplitude - startPoint.amplitude) * startProgress
        val endAmplitude =
            startPoint.amplitude + (endPoint.amplitude - startPoint.amplitude) * endProgress
        val startFrequency =
            startPoint.frequency + (endPoint.frequency - startPoint.frequency) * startProgress
        val endFrequency =
            startPoint.frequency + (endPoint.frequency - startPoint.frequency) * endProgress

        return ((startAmplitude + endAmplitude) / 2f) to ((startFrequency + endFrequency) / 2f)
    }
}
