package com.swmansion.pulsar.lottie

import com.swmansion.pulsar.kmp.ConfigPoint
import com.swmansion.pulsar.kmp.ContinuousPattern
import com.swmansion.pulsar.kmp.PatternData
import com.swmansion.pulsar.kmp.ValuePoint
import kotlin.test.Test
import kotlin.test.assertEquals

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
