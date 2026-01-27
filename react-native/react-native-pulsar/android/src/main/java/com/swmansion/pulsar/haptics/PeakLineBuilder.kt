package com.swmansion.pulsar.haptics

import com.swmansion.pulsar.types.ConfigPoint
import com.swmansion.pulsar.types.ValuePoint

class PeakLineBuilder() {
    fun convertToContinuesPatternOfAmplitude(
        pattern: List<ConfigPoint>,
        baseline: ValueLineBuilder
    ): ValueLineBuilder {
        return convertToContinuesPattern(pattern, baseline, true)
    }

    fun convertToContinuesPatternOfFrequency(
        pattern: List<ConfigPoint>,
        baseline: ValueLineBuilder
    ): ValueLineBuilder {
        return convertToContinuesPattern(pattern, baseline, false)
    }

    private fun convertToContinuesPattern(
        pattern: List<ConfigPoint>,
        baseline: ValueLineBuilder,
        useAmplitude: Boolean
    ): ValueLineBuilder {
        val line = ValueLineBuilder()
        pattern.forEach {
            val value = if (useAmplitude) { it.amplitude } else { it.frequency }
            val timings = peakTiming(it.time)
            val startPeak = ValuePoint(timings[0], baseline.valueForX(timings[0]))
            val reachMax = ValuePoint(timings[1], value)
            val leaveMax = ValuePoint(timings[2], value)
            val endPeak = ValuePoint(timings[3], baseline.valueForX(timings[3]))
            line.pushPoint(startPeak)
            line.pushPoint(reachMax)
            line.pushPoint(leaveMax)
            line.pushPoint(endPeak)
        }
        return line
    }

    private fun peakTiming(time: Float): List<Float> {
        val slopeDuration = 15f / 1000
        val peakDuration = 10f / 1000
        return listOf(
            time - slopeDuration - peakDuration / 2,
            time - peakDuration / 2,
            time + peakDuration / 2,
            time + peakDuration / 2 + 0.001f,
        )
    }
}
