package com.swmansion.pulsar.haptics

import com.swmansion.pulsar.types.ConfigPoint
import com.swmansion.pulsar.types.ValuePoint
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * [PeakLineBuilder] expands each discrete impulse into a 4-point "peak" on the continuous line:
 * rise from the baseline to the impulse value, a short plateau, then an near-instant fall back to
 * the baseline. The peak width is driven by `minTransitionDuration` (the per-device minimum a motor
 * can follow).
 */
class PeakLineBuilderTest {

    private fun baseline(vararg points: Pair<Long, Float>) = ValueLineBuilder().apply {
        points.forEach { pushPoint(ValuePoint(it.first, it.second)) }
    }

    @Test
    fun expandsAnImpulseIntoFourTimedPoints() {
        val builder = PeakLineBuilder(minTransitionDuration = 15L)
        val impulse = listOf(ConfigPoint(time = 100L, amplitude = 1f, frequency = 0.3f))

        val line = builder.convertToContinuousPatternOfAmplitude(impulse, baseline())

        // half = (15 * 0.25 / 2) = 1; slope = 15 - 2 = 13 → offsets [-14, -1, +1, +2].
        assertEquals(listOf(86L, 99L, 101L, 102L), line.points.map { it.time })
        assertEquals(listOf(0f, 1f, 1f, 0f), line.points.map { it.value })
    }

    @Test
    fun plateauCarriesAmplitudeForTheAmplitudeVariant() {
        val builder = PeakLineBuilder(minTransitionDuration = 15L)
        val impulse = listOf(ConfigPoint(time = 100L, amplitude = 0.7f, frequency = 0.3f))

        val line = builder.convertToContinuousPatternOfAmplitude(impulse, baseline())
        // The two middle (plateau) points carry the amplitude.
        assertEquals(0.7f, line.points[1].value, 1e-6f)
        assertEquals(0.7f, line.points[2].value, 1e-6f)
    }

    @Test
    fun plateauCarriesFrequencyForTheFrequencyVariant() {
        val builder = PeakLineBuilder(minTransitionDuration = 15L)
        val impulse = listOf(ConfigPoint(time = 100L, amplitude = 0.7f, frequency = 0.3f))

        val line = builder.convertToContinuousPatternOfFrequency(impulse, baseline())
        assertEquals(0.3f, line.points[1].value, 1e-6f)
        assertEquals(0.3f, line.points[2].value, 1e-6f)
    }

    @Test
    fun risesFromAndReturnsToTheBaselineValue() {
        val builder = PeakLineBuilder(minTransitionDuration = 15L)
        val flatBaseline = baseline(0L to 0.2f, 300L to 0.2f)
        val impulse = listOf(ConfigPoint(time = 100L, amplitude = 1f, frequency = 0.3f))

        val line = builder.convertToContinuousPatternOfAmplitude(impulse, flatBaseline)
        assertEquals("rise starts at the baseline", 0.2f, line.points.first().value, 1e-6f)
        assertEquals("fall returns to the baseline", 0.2f, line.points.last().value, 1e-6f)
    }

    @Test
    fun widerTransitionDurationMakesAWiderPeak() {
        val impulse = listOf(ConfigPoint(time = 200L, amplitude = 1f, frequency = 0.3f))
        val narrow = PeakLineBuilder(15L).convertToContinuousPatternOfAmplitude(impulse, baseline())
        val wide = PeakLineBuilder(35L).convertToContinuousPatternOfAmplitude(impulse, baseline())

        val narrowSpan = narrow.points.last().time - narrow.points.first().time
        val wideSpan = wide.points.last().time - wide.points.first().time
        assertTrue("a larger minTransitionDuration must widen the peak", wideSpan > narrowSpan)
    }

    @Test
    fun emitsFourPointsPerImpulse() {
        val builder = PeakLineBuilder(minTransitionDuration = 15L)
        val impulses = listOf(
            ConfigPoint(time = 0L, amplitude = 1f, frequency = 0.3f),
            ConfigPoint(time = 500L, amplitude = 1f, frequency = 0.3f),
        )
        val line = builder.convertToContinuousPatternOfAmplitude(impulses, baseline())
        assertEquals(8, line.points.size)
    }

    @Test
    fun emptyPatternProducesEmptyLine() {
        val builder = PeakLineBuilder(minTransitionDuration = 15L)
        val line = builder.convertToContinuousPatternOfAmplitude(emptyList(), baseline())
        assertTrue(line.points.isEmpty())
    }
}
