package com.swmansion.pulsar.types

import org.junit.Assert.assertEquals
import org.junit.Assert.assertThrows
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * [PatternData]'s secondary constructor is the boundary where the cross-platform "raw" pattern
 * format (nested float arrays coming from JS / preset literals) is parsed into typed points. These
 * tests pin that parsing and document that it is strict about shape.
 */
class PatternDataTest {

    @Test
    fun parsesRawContinuousAndDiscretePatterns() {
        val data = PatternData(
            rawContinuousPattern = listOf(
                listOf(listOf(0f, 0.2f), listOf(100f, 0.8f)),
                listOf(listOf(0f, 0.5f), listOf(100f, 0.5f)),
            ),
            rawDiscretePattern = listOf(listOf(10f, 1f, 0.3f)),
        )

        assertEquals(listOf(0L, 100L), data.continuousPattern.amplitude.map { it.time })
        assertEquals(listOf(0.2f, 0.8f), data.continuousPattern.amplitude.map { it.value })
        assertEquals(listOf(0.5f, 0.5f), data.continuousPattern.frequency.map { it.value })

        assertEquals(1, data.discretePattern.size)
        val impulse = data.discretePattern.single()
        assertEquals(10L, impulse.time)
        assertEquals(1f, impulse.amplitude, 0f)
        assertEquals(0.3f, impulse.frequency, 0f)
    }

    @Test
    fun defaultsToEmptyPattern() {
        val data = PatternData()
        assertTrue(data.continuousPattern.amplitude.isEmpty())
        assertTrue(data.continuousPattern.frequency.isEmpty())
        assertTrue(data.discretePattern.isEmpty())
    }

    @Test
    fun floatTimesAreTruncatedToLongMillis() {
        val data = PatternData(
            rawContinuousPattern = listOf(listOf(listOf(12.9f, 0.5f)), listOf()),
            rawDiscretePattern = listOf(),
        )
        assertEquals(12L, data.continuousPattern.amplitude.single().time)
    }

    @Test
    fun rejectsContinuousPatternMissingTheFrequencyChannel() {
        // The raw form must always carry both amplitude[0] and frequency[1] channels.
        assertThrows(IndexOutOfBoundsException::class.java) {
            PatternData(rawContinuousPattern = listOf(listOf(listOf(0f, 0.5f))))
        }
    }

    @Test
    fun rejectsDiscretePointMissingFrequency() {
        // Each discrete triple must be [time, amplitude, frequency].
        assertThrows(IndexOutOfBoundsException::class.java) {
            PatternData(rawDiscretePattern = listOf(listOf(0f, 0.5f)))
        }
    }
}
