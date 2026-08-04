package com.swmansion.pulsar.haptics

import com.swmansion.pulsar.types.ConfigPoint
import com.swmansion.pulsar.types.ControlPoint
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * The timing-only rendering that stands in for amplitude/frequency on a bare on/off actuator.
 *
 * [PwmHapticsGenerator] both holds the pulse/pause profile (intensity widens the pulse, frequency
 * shortens the gap) and turns control lines / impulses into the `[off, on, off, on, …]` array that
 * `VibrationEffect.createWaveform(timings, -1)` wants:
 *  - [PwmHapticsGenerator.buildPwmTimings] turns a continuous intensity/frequency line into a
 *    pulse-width-modulated train — the fix for continuous presets flattening into one monotonous
 *    buzz.
 *  - [PwmHapticsGenerator.buildImpulseTimings] maps discrete impulses straight to pulses, one per
 *    impulse, without building a line in between.
 */
class PwmHapticsGeneratorTest {

    /** The weak-ERM profile these behaviours are tuned for (the moto g05 tier). */
    private val generator = PwmHapticsGenerator.forActuator(
        HapticEngineWrapper.WEAK_ACTUATOR_MIN_CONTROL_POINT_DURATION_MS,
    )

    private fun offs(timings: LongArray): List<Long> = timings.filterIndexed { i, _ -> i % 2 == 0 }
    private fun ons(timings: LongArray): List<Long> = timings.filterIndexed { i, _ -> i % 2 == 1 }

    /** Gaps between pulses — drops the leading off, which is only the start delay. */
    private fun interiorGaps(timings: LongArray): List<Long> = offs(timings).drop(1)

    // region intensity -> width, frequency -> gap

    @Test
    fun pulseWidthGrowsWithIntensity() {
        val weak = generator.resolveShotWidth(0.0f, capMs = 500L)
        val strong = generator.resolveShotWidth(1.0f, capMs = 500L)

        assertEquals(generator.minPulseMs, weak)
        assertEquals(generator.maxPulseMs, strong)
        assertTrue("a stronger tap must be a wider pulse", strong > weak)
    }

    @Test
    fun pulseNeverDropsBelowTheFeltFloor() {
        // Even the faintest non-silent point must still spin the motor up.
        val faint = generator.resolveShotWidth(0.01f, capMs = 500L)
        assertTrue("pulse below the felt floor: $faint ms", faint >= generator.minPulseMs)
    }

    @Test
    fun pulseIsCappedToTheRoomAvailable() {
        // A short segment cannot host a long pulse, but the floor still wins over the cap.
        assertEquals(80L, generator.resolveShotWidth(1.0f, capMs = 80L))
        assertEquals(generator.minPulseMs, generator.resolveShotWidth(1.0f, capMs = 10L))
    }

    @Test
    fun gapShrinksAsFrequencyRises() {
        val slow = generator.resolvePauseWidth(0.0f)
        val fast = generator.resolvePauseWidth(1.0f)

        assertEquals(generator.maxPauseMs, slow)
        assertEquals(generator.minPauseMs, fast)
        assertTrue("higher frequency must pack pulses closer together", fast < slow)
    }

    @Test
    fun actuatorFloorSetsTheMinimumPulse() {
        val weak = PwmHapticsGenerator.forActuator(35L)
        val fast = PwmHapticsGenerator.forActuator(12L)

        assertEquals(35L, weak.minPulseMs)
        assertEquals(12L, fast.minPulseMs)
        assertTrue(weak.maxPulseMs >= weak.minPulseMs)
    }

    // endregion

    // region discrete impulses -> pulses

    @Test
    fun mapsEachImpulseToItsOwnFeltPulse() {
        // Stomp: three full-power taps at 0 / 75 / 150 ms.
        val stomp = listOf(
            ConfigPoint(time = 0L, amplitude = 1.0f, frequency = 0.3f),
            ConfigPoint(time = 75L, amplitude = 1.0f, frequency = 0.3f),
            ConfigPoint(time = 150L, amplitude = 1.0f, frequency = 0.3f),
        )

        val timings = generator.buildImpulseTimings(stomp)!!

        val pulses = ons(timings)
        assertEquals("one pulse per impulse, not a merged buzz", 3, pulses.size)
        pulses.forEach {
            assertTrue("pulse too narrow to spin up the motor: $it ms", it >= generator.minPulseMs)
        }

        val gaps = interiorGaps(timings)
        assertEquals(2, gaps.size)
        gaps.forEach {
            assertTrue("gap too short to read as separate taps: $it ms", it >= generator.minPauseMs)
        }
    }

    @Test
    fun impulsePulseWidthTracksAmplitude() {
        fun firstPulse(amplitude: Float): Long {
            val impulses = listOf(
                ConfigPoint(time = 0L, amplitude = amplitude, frequency = 0.3f),
                ConfigPoint(time = 300L, amplitude = amplitude, frequency = 0.3f),
            )
            return ons(generator.buildImpulseTimings(impulses)!!).first()
        }

        assertTrue("a stronger impulse must be a wider pulse", firstPulse(1.0f) > firstPulse(0.2f))
    }

    @Test
    fun impulseBuilderIgnoresEmptyInput() {
        assertNull(generator.buildImpulseTimings(emptyList()))
    }

    // endregion

    // region continuous line -> PWM train

    @Test
    fun continuousRunBecomesAPulseTrainNotOneBuzz() {
        // The regression this whole change is about: a solid continuous segment used to collapse
        // into a single on. It must now be chopped into a modulated train.
        val timings = generator.buildPwmTimings(
            listOf(ControlPoint(intensity = 0.5f, sharpness = 0.5f, duration = 400L)),
        )!!

        assertTrue("continuous run must pulse, got ${ons(timings)}", ons(timings).size >= 2)
        interiorGaps(timings).forEach {
            assertTrue("pulses must be separated by real silence: $it ms", it > 0L)
        }
    }

    @Test
    fun pulseWidthFollowsIntensity() {
        val strong = generator.buildPwmTimings(
            listOf(ControlPoint(intensity = 1.0f, sharpness = 0.5f, duration = 600L)),
        )!!
        val weak = generator.buildPwmTimings(
            listOf(ControlPoint(intensity = 0.2f, sharpness = 0.5f, duration = 600L)),
        )!!

        assertTrue(
            "higher intensity must widen the pulses",
            ons(strong).maxOrNull()!! > ons(weak).maxOrNull()!!,
        )
    }

    @Test
    fun gapWidthFollowsFrequency() {
        val dense = generator.buildPwmTimings(
            listOf(ControlPoint(intensity = 0.5f, sharpness = 1.0f, duration = 600L)),
        )!!
        val sparse = generator.buildPwmTimings(
            listOf(ControlPoint(intensity = 0.5f, sharpness = 0.0f, duration = 600L)),
        )!!

        assertTrue(
            "higher frequency must pack the pulses closer together",
            interiorGaps(dense).maxOrNull()!! < interiorGaps(sparse).maxOrNull()!!,
        )
    }

    @Test
    fun silentStretchesBecomeGaps() {
        val timings = generator.buildPwmTimings(
            listOf(
                ControlPoint(intensity = 0.3f, sharpness = 1.0f, duration = 60L),
                ControlPoint(intensity = 0.0f, sharpness = 0.0f, duration = 200L),
                ControlPoint(intensity = 0.3f, sharpness = 1.0f, duration = 60L),
            ),
        )!!

        assertTrue(
            "the 200 ms silence must read as a long gap, got offs ${offs(timings)}",
            offs(timings).maxOrNull()!! >= 150L,
        )
    }

    @Test
    fun pwmBuilderRejectsNothingToPlay() {
        assertNull(generator.buildPwmTimings(emptyList()))
        assertNull(
            generator.buildPwmTimings(
                listOf(ControlPoint(intensity = 0.0f, sharpness = 0.0f, duration = 100L)),
            ),
        )
    }

    // endregion
}
