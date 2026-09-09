package com.swmansion.pulsar.lottie

import com.swmansion.pulsar.types.ConfigPoint
import com.swmansion.pulsar.types.ContinuousPattern
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.ValuePoint
import org.junit.Assert.assertEquals
import org.junit.Test

class SamplerTest {
    private val env = listOf(
        ValuePoint(0L, 0f),
        ValuePoint(400L, 1f),
        ValuePoint(800L, 0f),
    )

    @Test
    fun clampsOutsideRange() {
        assertEquals(0f, sampleEnvelope(env, -50L), 1e-6f)
        assertEquals(0f, sampleEnvelope(env, 900L), 1e-6f)
    }

    @Test
    fun exactKnot() {
        assertEquals(1f, sampleEnvelope(env, 400L), 1e-6f)
    }

    @Test
    fun interpolatesLinearly() {
        assertEquals(0.5f, sampleEnvelope(env, 200L), 1e-6f)
        assertEquals(0.5f, sampleEnvelope(env, 600L), 1e-6f)
    }

    @Test
    fun singlePointHoldsItsValue() {
        val flat = listOf(ValuePoint(500L, 0.7f))
        assertEquals(0.7f, sampleEnvelope(flat, 0L), 1e-6f)
        assertEquals(0.7f, sampleEnvelope(flat, 500L), 1e-6f)
        assertEquals(0.7f, sampleEnvelope(flat, 10_000L), 1e-6f)
    }

    @Test
    fun zeroWidthSpanTakesTheLaterValue() {
        val step = listOf(
            ValuePoint(0L, 0f),
            ValuePoint(400L, 0.2f),
            ValuePoint(400L, 0.9f),
            ValuePoint(800L, 1f),
        )
        assertEquals(0.2f, sampleEnvelope(step, 400L), 1e-6f)
        assertEquals(0.95f, sampleEnvelope(step, 600L), 1e-6f)
    }

    @Test
    fun emptyPatternHasNoLength() {
        assertEquals(
            0L,
            patternDurationMs(
                PatternData(
                    continuousPattern = ContinuousPattern(emptyList(), emptyList()),
                    discretePattern = emptyList(),
                ),
            ),
        )
    }

    @Test
    fun aLateTransientCanBeTheLongestChannel() {
        val p = PatternData(
            continuousPattern = ContinuousPattern(
                amplitude = listOf(ValuePoint(0L, 0f), ValuePoint(300L, 1f)),
                frequency = listOf(ValuePoint(0L, 0.3f)),
            ),
            discretePattern = listOf(ConfigPoint(1200L, 1f, 0.5f)),
        )
        assertEquals(1200L, patternDurationMs(p))
    }

    @Test
    fun emptyCurveIsZero() {
        assertEquals(0f, sampleEnvelope(emptyList(), 100L), 1e-6f)
    }

    @Test
    fun durationIsLargestTimestamp() {
        val p = PatternData(
            continuousPattern = ContinuousPattern(
                amplitude = listOf(ValuePoint(0L, 0f), ValuePoint(800L, 1f)),
                frequency = listOf(ValuePoint(0L, 0.3f), ValuePoint(600L, 0.8f)),
            ),
            discretePattern = listOf(ConfigPoint(0L, 1f, 0.5f), ConfigPoint(250L, 0.5f, 0.5f)),
        )
        assertEquals(800L, patternDurationMs(p))
    }

    @Test
    fun clampRange() {
        assertEquals(0f, clamp01(-1f), 1e-6f)
        assertEquals(1f, clamp01(5f), 1e-6f)
        assertEquals(0.4f, clamp01(0.4f), 1e-6f)
    }
}
