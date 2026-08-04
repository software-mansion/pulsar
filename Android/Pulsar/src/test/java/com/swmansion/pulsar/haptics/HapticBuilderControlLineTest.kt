package com.swmansion.pulsar.haptics

import com.swmansion.pulsar.types.PatternData
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * End-to-end coverage of the pure companion [HapticBuilder.buildControlLine], which wires the whole
 * line-builder pipeline (value → peak → config → control) for a preset without needing a device.
 * This is the seam the existing impulse-fallback tests already lean on; here we exercise the
 * continuous and mixed shapes.
 */
class HapticBuilderControlLineTest {

    /** A triangular continuous envelope: silent → full at 500ms → silent at 1000ms. */
    private val continuousPreset = PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0f, 0f), listOf(500f, 1f), listOf(1000f, 0f)),
            listOf(listOf(0f, 0.5f), listOf(1000f, 0.5f)),
        ),
        rawDiscretePattern = listOf(),
    )

    @Test
    fun continuousEnvelopeSurvivesAsLinearPoints() {
        val line = HapticBuilder.buildControlLine(continuousPreset, 15L)
        val points = line.getLinearPoints()

        assertEquals(listOf(0f, 1f, 0f), points.map { it.intensity })
        assertEquals(listOf(1L, 500L, 500L), points.map { it.duration })
        points.forEach { assertEquals(0.5f, it.sharpness, 1e-6f) }
    }

    @Test
    fun continuousEnvelopeQuantizesToBucketsCoveringTheTimeline() {
        val steps = HapticBuilder.buildControlLine(continuousPreset, 15L).getStepsPoints()

        assertEquals("buckets must tile the full 1000ms", 1000L, steps.sumOf { it.duration })
        assertTrue("the ramp peak must survive quantization", steps.maxOf { it.intensity } > 0.8f)
    }

    @Test
    fun mixedPresetMergesDiscretePeaksIntoTheContinuousLine() {
        val mixed = PatternData(
            rawContinuousPattern = listOf(
                listOf(listOf(0f, 0.2f), listOf(400f, 0.2f)),
                listOf(listOf(0f, 0.5f), listOf(400f, 0.5f)),
            ),
            rawDiscretePattern = listOf(listOf(200f, 1f, 0.3f)),
        )

        val points = HapticBuilder.buildControlLine(mixed, 15L).getLinearPoints()

        // The flat 0.2 baseline is present, and the impulse injects a full-power peak on top.
        assertTrue("baseline floor present", points.any { it.intensity in 0.15f..0.25f })
        assertTrue("impulse peak present", points.any { it.intensity > 0.9f })
    }
}
