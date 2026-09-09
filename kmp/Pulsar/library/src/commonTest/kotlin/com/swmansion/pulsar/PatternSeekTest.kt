package com.swmansion.pulsar.kmp

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertSame
import kotlin.test.assertTrue

/** Re-anchoring an authored pattern so it can be replayed from a seek position. */
class PatternSeekTest {

    private val ramp = PatternData(
        continuousPattern = ContinuousPattern(
            amplitude = listOf(ValuePoint(0L, 0f), ValuePoint(1000L, 1f)),
            frequency = listOf(ValuePoint(0L, 0.2f), ValuePoint(500L, 0.8f)),
        ),
        discretePattern = listOf(
            ConfigPoint(0L, 1f, 0.5f),
            ConfigPoint(400L, 0.8f, 0.4f),
            ConfigPoint(1000L, 0.6f, 0.3f),
        ),
    )

    @Test
    fun durationIsTheLastTimestampAcrossBothLines() {
        assertEquals(1000L, PatternSeek.durationOf(ramp))
    }

    @Test
    fun seekingToZeroReturnsTheSamePattern() {
        assertSame(ramp, PatternSeek.patternFrom(ramp, 0L))
        assertSame(ramp, PatternSeek.patternFrom(ramp, -100L))
    }

    @Test
    fun discreteEventsBeforeTheSeekAreDroppedAndTheRestRebased() {
        val seeked = PatternSeek.patternFrom(ramp, 400L)
        assertEquals(listOf(0L, 600L), seeked.discretePattern.map { it.time })
        assertEquals(listOf(0.8f, 0.6f), seeked.discretePattern.map { it.amplitude })
    }

    @Test
    fun envelopeIsReanchoredOnItsInterpolatedValue() {
        val seeked = PatternSeek.patternFrom(ramp, 250L)
        assertEquals(listOf(0L, 750L), seeked.continuousPattern.amplitude.map { it.time })
        assertEquals(listOf(0.25f, 1f), seeked.continuousPattern.amplitude.map { it.value })
    }

    /**
     * Emptying it instead would silence BOTH channels, since the composer only builds the
     * continuous line when amplitude and frequency are each non-empty.
     */
    @Test
    fun anEnvelopeEntirelyBeforeTheSeekHoldsItsLastValue() {
        val seeked = PatternSeek.patternFrom(ramp, 800L)
        assertEquals(listOf(ValuePoint(0L, 0.8f), ValuePoint(200L, 0.8f)), seeked.continuousPattern.frequency)
        assertTrue(seeked.continuousPattern.amplitude.isNotEmpty())
    }

    @Test
    fun anEmptyEnvelopeStaysEmpty() {
        val noFrequency = PatternData(
            ContinuousPattern(ramp.continuousPattern.amplitude, emptyList()),
            emptyList(),
        )
        assertTrue(PatternSeek.patternFrom(noFrequency, 250L).continuousPattern.frequency.isEmpty())
    }
}
