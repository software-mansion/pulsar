package com.swmansion.pulsar.types

import org.junit.Assert.assertEquals
import org.junit.Assert.assertSame
import org.junit.Assert.assertTrue
import org.junit.Test

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
    fun `duration is the last timestamp across both lines`() {
        assertEquals(1000L, PatternSeek.lastTimestampOf(ramp))
        val empty = PatternData(ContinuousPattern(emptyList(), emptyList()), emptyList())
        assertEquals(0L, PatternSeek.lastTimestampOf(empty))
    }

    @Test
    fun `seeking to zero returns the same pattern`() {
        assertSame(ramp, PatternSeek.patternFrom(ramp, 0L))
        assertSame(ramp, PatternSeek.patternFrom(ramp, -100L))
    }

    @Test
    fun `discrete events before the seek are dropped and the rest rebased`() {
        val seeked = PatternSeek.patternFrom(ramp, 400L)
        assertEquals(listOf(0L, 600L), seeked.discretePattern.map { it.time })
        assertEquals(listOf(0.8f, 0.6f), seeked.discretePattern.map { it.amplitude })
    }

    @Test
    fun `envelope is re-anchored on its interpolated value`() {
        val seeked = PatternSeek.patternFrom(ramp, 250L)
        assertEquals(listOf(0L, 750L), seeked.continuousPattern.amplitude.map { it.time })
        assertEquals(listOf(0.25f, 1f), seeked.continuousPattern.amplitude.map { it.value })
    }

    @Test
    fun `an envelope entirely before the seek holds its last value`() {
        val seeked = PatternSeek.patternFrom(ramp, 800L)
        assertEquals(listOf(0L, 200L), seeked.continuousPattern.frequency.map { it.time })
        assertEquals(listOf(0.8f, 0.8f), seeked.continuousPattern.frequency.map { it.value })
        assertTrue(seeked.continuousPattern.amplitude.isNotEmpty())
    }

    @Test
    fun `a held envelope collapses to one point once nothing remains`() {
        val seeked = PatternSeek.patternFrom(ramp, 1000L)
        assertEquals(listOf(ValuePoint(0L, 0.8f)), seeked.continuousPattern.frequency)
    }

    @Test
    fun `an empty envelope stays empty`() {
        val noFrequency = PatternData(
            ContinuousPattern(ramp.continuousPattern.amplitude, emptyList()),
            emptyList(),
        )
        assertTrue(PatternSeek.patternFrom(noFrequency, 250L).continuousPattern.frequency.isEmpty())
    }

    @Test
    fun `sound seeks into the file by the same amount`() {
        val seeked = PatternSeek.soundFrom(SoundData(uri = "clip.wav"), 300L)
        assertEquals(0L, seeked.offset)
        assertEquals(300L, seeked.startMs)
        assertEquals(0L, seeked.durationMs)
    }

    @Test
    fun `sound eats into the lead-in before it touches the file`() {
        val early = PatternSeek.soundFrom(SoundData(uri = "clip.wav", offset = 500L), 200L)
        assertEquals(300L, early.offset)
        assertEquals(0L, early.startMs)

        val late = PatternSeek.soundFrom(SoundData(uri = "clip.wav", offset = 500L), 800L)
        assertEquals(0L, late.offset)
        assertEquals(300L, late.startMs)
    }

    @Test
    fun `an authored trim window shrinks and its start advances`() {
        val sound = SoundData(uri = "clip.wav", startMs = 1000L, durationMs = 900L)
        val seeked = PatternSeek.soundFrom(sound, 400L)
        assertEquals(1400L, seeked.startMs)
        assertEquals(500L, seeked.durationMs)
    }
}
