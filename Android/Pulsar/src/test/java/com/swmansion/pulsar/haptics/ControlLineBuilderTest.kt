package com.swmansion.pulsar.haptics

import com.swmansion.pulsar.types.ValuePoint
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * [ControlLineBuilder] turns the fused config line into the [com.swmansion.pulsar.types.ControlPoint]
 * stream the effect generators consume, in two flavours:
 *  - [ControlLineBuilder.getLinearPoints] — one control point per config point, duration = the gap
 *    to the previous point.
 *  - [ControlLineBuilder.getStepsPoints] — a fixed ~13 Hz quantizer that area-averages amplitude and
 *    frequency into evenly-spaced buckets (the path that sluggish LRAs can actually follow).
 */
class ControlLineBuilderTest {

    private fun valueLine(vararg points: Pair<Long, Float>) = ValueLineBuilder().apply {
        points.forEach { pushPoint(ValuePoint(it.first, it.second)) }
    }

    private fun controlLine(
        amplitude: List<Pair<Long, Float>>,
        frequency: List<Pair<Long, Float>>,
    ): ControlLineBuilder {
        val amp = ValueLineBuilder().apply { amplitude.forEach { pushPoint(ValuePoint(it.first, it.second)) } }
        val freq = ValueLineBuilder().apply { frequency.forEach { pushPoint(ValuePoint(it.first, it.second)) } }
        return ControlLineBuilder(ConfigLineBuilder(amp, freq))
    }

    // region getLinearPoints

    @Test
    fun linearPointsUseGapsToThePreviousPointAsDuration() {
        val line = controlLine(
            amplitude = listOf(0L to 0f, 50L to 0.5f, 100L to 1f),
            frequency = listOf(0L to 0.3f, 100L to 0.3f),
        )

        val points = line.getLinearPoints()

        assertEquals(3, points.size)
        assertEquals(listOf(1L, 50L, 50L), points.map { it.duration })
        assertEquals(listOf(0f, 0.5f, 1f), points.map { it.intensity })
        points.forEach { assertEquals(0.3f, it.sharpness, 1e-6f) }
    }

    @Test
    fun firstLinearPointDurationIsFlooredToOne() {
        // First config point at time 0 → maxOf(1, 0) == 1, never 0.
        val line = controlLine(
            amplitude = listOf(0L to 0.4f, 10L to 0.4f),
            frequency = listOf(0L to 0.4f, 10L to 0.4f),
        )
        assertEquals(1L, line.getLinearPoints().first().duration)
    }

    @Test
    fun emptyConfigProducesNoLinearPoints() {
        val line = ControlLineBuilder(ConfigLineBuilder(ValueLineBuilder(), ValueLineBuilder()))
        assertTrue(line.getLinearPoints().isEmpty())
    }

    // endregion

    // region getStepsPoints

    @Test
    fun quantizesIntoFixedWidthBucketsThatCoverTheWholeTimeline() {
        // Constant 0.5 line over 1000ms. 13 buckets of 76ms + a 12ms remainder = 1000ms.
        val line = controlLine(
            amplitude = listOf(0L to 0.5f, 1000L to 0.5f),
            frequency = listOf(0L to 0.5f, 1000L to 0.5f),
        )

        val points = line.getStepsPoints()

        assertEquals(1000L, points.sumOf { it.duration })
        assertEquals(76L, points.first().duration)
        assertEquals(12L, points.last().duration)
        // A flat input must stay flat after averaging.
        points.forEach {
            assertEquals(0.5f, it.intensity, 1e-4f)
            assertEquals(0.5f, it.sharpness, 1e-4f)
        }
    }

    @Test
    fun emptyConfigProducesNoStepPoints() {
        val line = ControlLineBuilder(ConfigLineBuilder(ValueLineBuilder(), ValueLineBuilder()))
        assertTrue(line.getStepsPoints().isEmpty())
    }

    @Test
    fun clampsOutOfRangeAmplitudeAndFrequencyToUnitRange() {
        // Regression: preset data outside [0,1] must be clamped before the effect generator, which
        // otherwise scales intensity past a motor's 0..255 range.
        val line = controlLine(
            amplitude = listOf(0L to 2.0f, 100L to 2.0f),
            frequency = listOf(0L to -0.5f, 100L to -0.5f),
        )

        (line.getLinearPoints() + line.getStepsPoints()).forEach {
            assertTrue("intensity out of range: ${it.intensity}", it.intensity in 0f..1f)
            assertTrue("sharpness out of range: ${it.sharpness}", it.sharpness in 0f..1f)
        }
        // The over-range amplitude clamps to the ceiling, the negative frequency to the floor.
        assertEquals(1f, line.getLinearPoints().first().intensity, 0f)
        assertEquals(0f, line.getLinearPoints().first().sharpness, 0f)
    }

    @Test
    fun everyStepDurationIsAtLeastOne() {
        val line = controlLine(
            amplitude = listOf(0L to 0.2f, 200L to 0.9f),
            frequency = listOf(0L to 0.1f, 200L to 0.1f),
        )
        assertTrue(line.getStepsPoints().all { it.duration >= 1L })
    }

    // endregion
}
