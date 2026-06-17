package com.swmansion.pulsar.haptics

import com.swmansion.pulsar.types.PatternData
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Covers the impulse-only waveform fallback used on devices that can't play primitives.
 * These assertions pin the behaviour that fixes silent discrete haptics on weak ERM/LRA hardware:
 * every impulse must turn into a pulse wide enough to engage the motor (not the ~2 ms peak the
 * continuous fallback produced) while preserving the timing between impulses.
 */
class ImpulseCompositionHapticBuilderTest {

    private val pulseMs = 20L
    private val minAmplitude = 64

    @Test
    fun returnsNullWhenNoImpulses() {
        val preset = PatternData(rawDiscretePattern = listOf())
        assertNull(ImpulseCompositionHapticBuilder.buildImpulseWaveform(preset))
    }

    @Test
    fun rendersEachImpulseAsAPerceptiblePulse() {
        // Stomp: three full-power impulses at 0 / 75 / 150 ms.
        val preset = PatternData(
            rawDiscretePattern = listOf(
                listOf(0.0f, 1.0f, 0.3f),
                listOf(75.0f, 1.0f, 0.3f),
                listOf(150.0f, 1.0f, 0.3f),
            )
        )

        val (timings, amplitudes) = ImpulseCompositionHapticBuilder.buildImpulseWaveform(preset)!!

        // off/on pairs per impulse: [gap, pulse] x3
        assertEquals(
            listOf(0L, pulseMs, 55L, pulseMs, 55L, pulseMs),
            timings.toList(),
        )
        assertEquals(
            listOf(0, 255, 0, 255, 0, 255),
            amplitudes.toList(),
        )
        // Every on-pulse is the full motor-engaging width, never the ~2 ms transient.
        assertTrue(timings.filterIndexed { i, _ -> i % 2 == 1 }.all { it == pulseMs })
    }

    @Test
    fun floorsSoftImpulsesAboveTheActuatorThreshold() {
        // A quiet impulse must not scale down into the sub-perceptible dead zone.
        val preset = PatternData(
            rawDiscretePattern = listOf(listOf(0.0f, 0.05f, 0.5f)),
        )

        val (_, amplitudes) = ImpulseCompositionHapticBuilder.buildImpulseWaveform(preset)!!

        assertEquals(minAmplitude, amplitudes[1])
    }

    @Test
    fun mergesImpulsesCloserThanAPulseWidth() {
        // Impulses 10 ms apart (< pulse width) collapse the gap to 0 rather than dropping one.
        val preset = PatternData(
            rawDiscretePattern = listOf(
                listOf(0.0f, 1.0f, 0.5f),
                listOf(10.0f, 1.0f, 0.5f),
            )
        )

        val (timings, _) = ImpulseCompositionHapticBuilder.buildImpulseWaveform(preset)!!

        assertEquals(listOf(0L, pulseMs, 0L, pulseMs), timings.toList())
    }
}
