package com.swmansion.pulsar.haptics

import com.swmansion.pulsar.types.ValuePoint
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * [ConfigLineBuilder] fuses the independent amplitude and frequency lines onto a single, shared,
 * strictly-increasing timeline — sampling both lines at every timestamp either line mentions.
 */
class ConfigLineBuilderTest {

    private fun valueLine(vararg points: Pair<Long, Float>) = ValueLineBuilder().apply {
        points.forEach { pushPoint(ValuePoint(it.first, it.second)) }
    }

    @Test
    fun unionsAndSortsTimestampsFromBothLines() {
        val amplitude = valueLine(0L to 0f, 100L to 1f)
        val frequency = valueLine(0L to 0.5f, 50L to 0.5f, 100L to 0.5f)

        val config = ConfigLineBuilder(amplitude, frequency)

        assertEquals(listOf(0L, 50L, 100L), config.points.map { it.time })
    }

    @Test
    fun samplesEachLineAtEveryTimestamp() {
        val amplitude = valueLine(0L to 0f, 100L to 1f)
        val frequency = valueLine(0L to 0.5f, 50L to 0.5f, 100L to 0.5f)

        val config = ConfigLineBuilder(amplitude, frequency)
        val mid = config.points.first { it.time == 50L }

        assertEquals("amplitude interpolated at the frequency-only timestamp", 0.5f, mid.amplitude, 1e-6f)
        assertEquals("frequency sampled exactly", 0.5f, mid.frequency, 1e-6f)
    }

    @Test
    fun deduplicatesSharedTimestamps() {
        val amplitude = valueLine(0L to 0f, 50L to 0.5f, 100L to 1f)
        val frequency = valueLine(0L to 0.3f, 50L to 0.3f, 100L to 0.3f)

        val config = ConfigLineBuilder(amplitude, frequency)

        assertEquals(3, config.points.size)
        // Strictly increasing — the invariant getLinearPoints relies on for positive durations.
        val times = config.points.map { it.time }
        assertEquals(times.sorted(), times)
        assertTrue(times.zipWithNext().all { (a, b) -> b > a })
    }

    @Test
    fun emptyLinesProduceNoPoints() {
        val config = ConfigLineBuilder(ValueLineBuilder(), ValueLineBuilder())
        assertTrue(config.points.isEmpty())
    }
}
