package com.swmansion.pulsar.haptics

import com.swmansion.pulsar.types.ValuePoint
import org.junit.Assert.assertEquals
import org.junit.Assert.assertThrows
import org.junit.Test

/**
 * [ValueLineBuilder] is the pure geometry primitive every preset flows through: it keeps a
 * time-sorted list of [ValuePoint]s and linearly interpolates between them. These tests pin the
 * insertion ordering and the (deliberately asymmetric) out-of-range behaviour of `valueForX`.
 */
class ValueLineBuilderTest {

    private fun line(vararg points: Pair<Long, Float>) = ValueLineBuilder().apply {
        points.forEach { pushPoint(ValuePoint(it.first, it.second)) }
    }

    // region pushPoint — sorted insertion

    @Test
    fun keepsPointsSortedRegardlessOfInsertionOrder() {
        val builder = line(0L to 0f, 100L to 1f, 50L to 0.5f, 25L to 0.25f)
        assertEquals(listOf(0L, 25L, 50L, 100L), builder.points.map { it.time })
    }

    @Test
    fun appendsWhenTimeIsAtOrAfterTheLast() {
        val builder = line(0L to 0f, 100L to 1f, 100L to 0.7f)
        assertEquals(listOf(0L, 100L, 100L), builder.points.map { it.time })
        // Equal-to-last goes on the end, so the newest value is last.
        assertEquals(0.7f, builder.points.last().value, 0f)
    }

    @Test
    fun initialListSeedsThePoints() {
        val builder = ValueLineBuilder(listOf(ValuePoint(0L, 0.1f), ValuePoint(10L, 0.2f)))
        assertEquals(2, builder.points.size)
        assertEquals(0.2f, builder.valueForX(10L), 0f)
    }

    // endregion

    // region valueForX — interpolation and boundaries

    @Test
    fun emptyLineIsSilent() {
        assertEquals(0f, ValueLineBuilder().valueForX(42L), 0f)
    }

    @Test
    fun exactTimestampReturnsItsOwnValue() {
        val builder = line(0L to 0f, 100L to 1f)
        assertEquals(0f, builder.valueForX(0L), 0f)
        assertEquals(1f, builder.valueForX(100L), 0f)
    }

    @Test
    fun interpolatesLinearlyBetweenPoints() {
        val builder = line(0L to 0f, 100L to 1f)
        assertEquals(0.5f, builder.valueForX(50L), 1e-6f)
        assertEquals(0.25f, builder.valueForX(25L), 1e-6f)
    }

    @Test
    fun outsideTheRangeReadsAsSilenceForMultiPointLines() {
        val builder = line(10L to 0.4f, 100L to 1f)
        assertEquals("before the first point", 0f, builder.valueForX(5L), 0f)
        assertEquals("after the last point", 0f, builder.valueForX(200L), 0f)
    }

    @Test
    fun singlePointLineReturnsItsValueEverywhere() {
        // A one-point line is treated as a constant — the size==1 short-circuit runs before the
        // out-of-range zeroing, so even far-away x's return the point's value.
        val builder = line(100L to 0.6f)
        assertEquals(0.6f, builder.valueForX(100L), 0f)
        assertEquals(0.6f, builder.valueForX(0L), 0f)
        assertEquals(0.6f, builder.valueForX(9999L), 0f)
    }

    // endregion

    // region mergeLine

    @Test
    fun mergeLineReplacesTheOverlappedBaselineWindow() {
        // A flat baseline every 25ms.
        val baseline = line(0L to 0.2f, 25L to 0.2f, 50L to 0.2f, 75L to 0.2f, 100L to 0.2f)
        // One 4-point peak group covering [25, 75].
        val peak = line(25L to 0.2f, 40L to 1f, 60L to 1f, 75L to 0.2f)

        baseline.mergeLine(peak)

        // Baseline points strictly inside [25,75] are dropped and replaced by the peak's points.
        val peakValue = baseline.valueForX(50L)
        assertEquals("merged window should carry the peak's plateau", 1f, peakValue, 1e-6f)
        // Endpoints outside the window survive.
        assertEquals(0.2f, baseline.valueForX(0L), 1e-6f)
        assertEquals(0.2f, baseline.valueForX(100L), 1e-6f)
    }

    @Test
    fun mergeLineAssumesGroupsOfFour() {
        // mergeLine walks in steps of 4 and reads points[i+3]; a non-multiple-of-4 line is a
        // programming error and throws rather than silently mis-grouping.
        val baseline = line(0L to 0f, 100L to 0f)
        val notAGroupOfFour = line(10L to 1f, 20L to 1f, 30L to 1f)
        assertThrows(IndexOutOfBoundsException::class.java) {
            baseline.mergeLine(notAGroupOfFour)
        }
    }

    // endregion
}
