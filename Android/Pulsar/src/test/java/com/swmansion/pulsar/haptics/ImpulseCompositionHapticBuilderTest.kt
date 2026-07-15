package com.swmansion.pulsar.haptics

import com.swmansion.pulsar.types.ControlPoint
import com.swmansion.pulsar.types.PatternData
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Covers how impulse-only presets are rendered when the device cannot play primitives and the
 * generic control-point path has to carry them.
 *
 * The bug these pin down: the default path quantizes the control line into ~13 Hz buckets and
 * area-averages each one, which flattens an impulse — a transient only a few ms wide — into a
 * sub-perceptible smear. On weak ERM/LRA hardware the motor never engages, so the preset is
 * silent. The fallback instead feeds the un-quantized linear points to the effect generator, which
 * keeps each impulse a discrete, full-power pulse.
 */
class ImpulseCompositionHapticBuilderTest {

    /** What [HapticEngineWrapper] hands us on hardware without primitive support. */
    private val impulseWidth = HapticEngineWrapper.WEAK_ACTUATOR_MIN_CONTROL_POINT_DURATION_MS

    /** Stomp: three full-power impulses at 0 / 75 / 150 ms, no continuous envelope. */
    private val stomp = PatternData(
        rawDiscretePattern = listOf(
            listOf(0.0f, 1.0f, 0.3f),
            listOf(75.0f, 1.0f, 0.3f),
            listOf(150.0f, 1.0f, 0.3f),
        )
    )

    /**
     * Collapses the control points into the on/off runs the motor actually sees, as
     * (isOn, totalDuration) pairs — the shape a timing-only device is driven with.
     */
    private fun runs(points: List<ControlPoint>): List<Pair<Boolean, Long>> {
        val runs = mutableListOf<Pair<Boolean, Long>>()
        for (point in points) {
            val isOn = point.intensity > 0f
            val last = runs.lastOrNull()
            if (last != null && last.first == isOn) {
                runs[runs.lastIndex] = isOn to (last.second + point.duration)
            } else {
                runs.add(isOn to point.duration)
            }
        }
        return runs
    }

    private fun pulseWidths(points: List<ControlPoint>) =
        runs(points).filter { it.first }.map { it.second }

    /** Silences between two pulses — excludes the leading and trailing ones. */
    private fun gapWidths(points: List<ControlPoint>): List<Long> {
        val runs = runs(points)
        return runs.filterIndexed { i, run -> !run.first && i > 0 && i < runs.lastIndex }
            .map { it.second }
    }

    private fun impulseFallbackPoints(preset: PatternData) =
        HapticBuilder.buildControlLine(preset, impulseWidth).getLinearPoints()

    @Test
    fun recognisesImpulseOnlyPresets() {
        assertTrue(ImpulseCompositionHapticBuilder.isImpulsesOnly(stomp))

        val withEnvelope = PatternData(
            rawContinuousPattern = listOf(
                listOf(listOf(0.0f, 0.8f), listOf(100.0f, 0.0f)),
                listOf(listOf(0.0f, 0.5f), listOf(100.0f, 0.5f)),
            ),
            rawDiscretePattern = listOf(listOf(0.0f, 1.0f, 0.5f)),
        )
        assertFalse(ImpulseCompositionHapticBuilder.isImpulsesOnly(withEnvelope))
    }

    @Test
    fun keepsEveryImpulseADistinctFullPowerPulse() {
        val points = impulseFallbackPoints(stomp)

        // One pulse per impulse — not merged into a single buzz.
        val pulses = pulseWidths(points)
        assertEquals(3, pulses.size)

        // Each pulse is wide enough to spin up a sluggish actuator. Measured floor: a moto g05
        // cannot feel a 20 ms pulse but does feel 40 ms.
        pulses.forEach { assertTrue("pulse too narrow to engage the motor: $it ms", it >= impulseWidth) }

        // Full power, not an average diluted by the surrounding silence.
        assertEquals(1.0f, points.filter { it.intensity > 0f }.maxOf { it.intensity }, 0.001f)

        // The rhythm survives: the three taps stay separated by real silence.
        val gaps = gapWidths(points)
        assertEquals(2, gaps.size)
        gaps.forEach { assertTrue("gap too short to read as separate taps: $it ms", it >= 25L) }
    }

    @Test
    fun carriesTheImpulseFrequency() {
        val points = impulseFallbackPoints(stomp)

        points.filter { it.intensity > 0f }.forEach {
            assertEquals(0.3f, it.sharpness, 0.001f)
        }
    }

    @Test
    fun quantizedPathWouldFlattenTheImpulsesIntoASmear() {
        // Guards the reason the fallback exists. Sending the same preset through the step
        // quantizer averages the transients away: three taps collapse into a couple of buckets at
        // roughly a tenth of full power — below a weak actuator's start threshold.
        val quantized = HapticBuilder.buildControlLine(stomp, 15L).getStepsPoints()

        assertTrue(quantized.size < 3)
        assertTrue(
            "expected the quantizer to dilute the impulses, got ${quantized.map { it.intensity }}",
            quantized.all { it.intensity < 0.15f },
        )
    }
}
