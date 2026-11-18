package com.swmansion.pulsar.haptics

import com.swmansion.pulsar.haptics.RichTapPatternEncoder.Continuous
import com.swmansion.pulsar.haptics.RichTapPatternEncoder.Transient
import com.swmansion.pulsar.types.ConfigPoint
import com.swmansion.pulsar.types.ContinuousPattern
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.ValuePoint
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.int
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class RichTapPatternEncoderTest {

    private fun pattern(
        amplitude: List<Pair<Long, Float>> = emptyList(),
        frequency: List<Pair<Long, Float>> = emptyList(),
        discrete: List<ConfigPoint> = emptyList(),
    ) = PatternData(
        ContinuousPattern(
            amplitude.map { ValuePoint(it.first, it.second) },
            frequency.map { ValuePoint(it.first, it.second) },
        ),
        discrete,
    )

    private fun events(pattern: PatternData) = RichTapPatternEncoder.toBlocks(pattern).flatMap { it.events }

    @Test
    fun emptyPatternEncodesToNothing() {
        assertNull(RichTapPatternEncoder.encode(pattern()))
    }

    @Test
    fun discretePointsBecomeTransientsInPercent() {
        val transient = events(pattern(discrete = listOf(ConfigPoint(120, 0.5f, 0.8f)))).single() as Transient

        assertEquals(120L, transient.start)
        assertEquals(50, transient.intensity)
        assertEquals(80, transient.frequency)
    }

    @Test
    fun silentDiscretePointsAreDropped() {
        assertNull(RichTapPatternEncoder.encode(pattern(discrete = listOf(ConfigPoint(0, 0f, 1f)))))
    }

    @Test
    fun envelopeBecomesContinuousEventWithFrequencyOffsets() {
        val event = events(
            pattern(
                amplitude = listOf(0L to 0f, 100L to 1f, 300L to 1f, 400L to 0f),
                frequency = listOf(0L to 0.2f, 400L to 0.6f),
            )
        ).single() as Continuous

        assertEquals(0L, event.start)
        assertEquals(400L, event.duration)
        assertEquals(20, event.frequency)
        assertEquals(listOf(0L, 100L, 300L, 400L), event.curve.map { it.time })
        assertEquals(listOf(0f, 1f, 1f, 0f), event.curve.map { it.intensity })
        assertEquals(40, event.curve.last().frequencyOffset)
    }

    @Test
    fun silentGapSplitsEnvelopeIntoSeparateEvents() {
        val continuous = events(
            pattern(
                amplitude = listOf(
                    0L to 0f, 50L to 1f, 100L to 0f,
                    500L to 0f, 550L to 1f, 600L to 0f,
                ),
                frequency = listOf(0L to 0.5f, 600L to 0.5f),
            )
        ).filterIsInstance<Continuous>()

        assertEquals(listOf(0L, 500L), continuous.map { it.start })
    }

    @Test
    fun shortCurvesArePaddedToMinimumPoints() {
        val event = events(pattern(amplitude = listOf(0L to 1f, 200L to 1f))).single() as Continuous

        assertEquals(RichTapPatternEncoder.MIN_CURVE_POINTS, event.curve.size)
        assertEquals(200L, event.curve.last().time)
    }

    @Test
    fun denseEnvelopesRespectCurveAndSpanLimits() {
        val amplitude = (0..200).map { it * 50L to if (it == 0 || it == 200) 0f else 0.7f }
        val continuous = events(pattern(amplitude = amplitude)).filterIsInstance<Continuous>()

        assertTrue(continuous.all { it.curve.size <= RichTapPatternEncoder.MAX_CURVE_POINTS })
        assertTrue(continuous.all { it.duration <= RichTapPatternEncoder.MAX_BLOCK_SPAN_MS })
        assertEquals(10_000L, continuous.last().end)
        continuous.zipWithNext().forEach { (a, b) -> assertEquals(a.end, b.start) }
    }

    @Test
    fun blocksRespectEventCountAndSpan() {
        val discrete = (0 until 100).map { ConfigPoint(it * 100L, 1f, 0.5f) }
        val blocks = RichTapPatternEncoder.toBlocks(pattern(discrete = discrete))

        assertTrue(blocks.all { it.events.size <= RichTapPatternEncoder.MAX_EVENTS_PER_BLOCK })
        assertTrue(blocks.all { b -> b.events.all { it.end - b.absoluteTime <= RichTapPatternEncoder.MAX_BLOCK_SPAN_MS } })
        assertEquals(100, blocks.sumOf { it.events.size })
    }

    @Test
    fun jsonUsesHe2RelativeTimes() {
        val json = RichTapPatternEncoder.encode(
            pattern(discrete = (0 until 20).map { ConfigPoint(it * 100L, 1f, 0.5f) })
        )!!
        val root = Json.parseToJsonElement(json).jsonObject
        val second = root["PatternList"]!!.jsonArray[1].jsonObject

        assertEquals(2, root["Metadata"]!!.jsonObject["Version"]!!.jsonPrimitive.int)
        assertEquals(1600, second["AbsoluteTime"]!!.jsonPrimitive.int)
        val firstEvent = second["Pattern"]!!.jsonArray[0].jsonObject["Event"]!!.jsonObject
        assertEquals(0, firstEvent["RelativeTime"]!!.jsonPrimitive.int)
        assertEquals("transient", firstEvent["Type"]!!.jsonPrimitive.content)
    }
}
