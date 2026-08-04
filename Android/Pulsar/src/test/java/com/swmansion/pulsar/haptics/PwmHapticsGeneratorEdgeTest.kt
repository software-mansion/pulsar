package com.swmansion.pulsar.haptics

import com.swmansion.pulsar.types.ConfigPoint
import com.swmansion.pulsar.types.ControlPoint
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Boundary / clamping coverage for [PwmHapticsGenerator] that complements the behavioural
 * `PwmHapticsGeneratorTest`: out-of-range inputs, degenerate actuator floors, and the null
 * "nothing to play" contract.
 */
class PwmHapticsGeneratorEdgeTest {

    private val generator = PwmHapticsGenerator.forActuator(
        HapticEngineWrapper.WEAK_ACTUATOR_MIN_CONTROL_POINT_DURATION_MS, // 35ms
    )

    // region clamping

    @Test
    fun shotWidthClampsIntensityToRange() {
        assertEquals(generator.minPulseMs, generator.resolveShotWidth(-0.5f, capMs = 500L))
        assertEquals(
            generator.resolveShotWidth(1.0f, capMs = 500L),
            generator.resolveShotWidth(2.0f, capMs = 500L),
        )
    }

    @Test
    fun pauseWidthClampsFrequencyToRange() {
        assertEquals(generator.maxPauseMs, generator.resolvePauseWidth(-1f))
        assertEquals(generator.minPauseMs, generator.resolvePauseWidth(5f))
    }

    @Test
    fun capBelowFloorCollapsesToTheFloor() {
        // A segment too short to host even the minimum pulse still yields the floor, never 0.
        assertEquals(generator.minPulseMs, generator.resolveShotWidth(1.0f, capMs = 20L))
    }

    // endregion

    // region forActuator floors

    @Test
    fun forActuatorNeverAllowsAZeroOrNegativeFloor() {
        assertEquals(1L, PwmHapticsGenerator.forActuator(0L).minPulseMs)
        assertEquals(1L, PwmHapticsGenerator.forActuator(-5L).minPulseMs)
    }

    @Test
    fun forActuatorKeepsMaxAtLeastAsLargeAsMin() {
        val slow = PwmHapticsGenerator.forActuator(500L)
        assertEquals(500L, slow.minPulseMs)
        assertTrue(slow.maxPulseMs >= slow.minPulseMs)
    }

    // endregion

    // region null "nothing to play" contract + output shape

    @Test
    fun pwmReturnsNullForEmptyAllSilentOrZeroDuration() {
        assertNull(generator.buildPwmTimings(emptyList()))
        assertNull(generator.buildPwmTimings(listOf(ControlPoint(0f, 0f, 100L))))
        assertNull(generator.buildPwmTimings(listOf(ControlPoint(0.5f, 0.5f, 0L))))
    }

    @Test
    fun impulseTimingsSortAndClampNegativeTimes() {
        val impulses = listOf(
            ConfigPoint(time = 100L, amplitude = 1f, frequency = 0.3f),
            ConfigPoint(time = -50L, amplitude = 1f, frequency = 0.3f),
        )

        val timings = generator.buildImpulseTimings(impulses)!!

        assertEquals("waveform must be [off, on, …] pairs", 0, timings.size % 2)
        assertTrue("no negative timings", timings.all { it >= 0L })
        assertEquals("leading gap clamps the negative start to 0", 0L, timings.first())
    }

    // endregion
}
