package com.swmansion.pulsar.kmp.androidimpl.haptics

import com.swmansion.pulsar.kmp.androidimpl.types.ConfigPoint
import com.swmansion.pulsar.kmp.androidimpl.types.ValuePoint

class PeakLineBuilder(private val minTransitionDuration: Long = 15L) {
    fun convertToContinuousPatternOfAmplitude(
        pattern: List<ConfigPoint>,
        baseline: ValueLineBuilder
    ): ValueLineBuilder {
        return convertToContinuousPattern(pattern, baseline, true)
    }

    fun convertToContinuousPatternOfFrequency(
        pattern: List<ConfigPoint>,
        baseline: ValueLineBuilder
    ): ValueLineBuilder {
        return convertToContinuousPattern(pattern, baseline, false)
    }

    private fun convertToContinuousPattern(
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

    private fun peakTiming(time: Long): List<Long> {
        val slopeDuration = (minTransitionDuration * 0.75).toLong()
        val peakDuration = (minTransitionDuration * 0.25).toLong()
        return listOf(
            time - slopeDuration - peakDuration / 2,
            time - peakDuration / 2,
            time + peakDuration / 2,
            time + peakDuration / 2 + 1L,
        )
    }
}
