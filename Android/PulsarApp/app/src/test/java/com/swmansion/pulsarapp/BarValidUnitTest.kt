package com.swmansion.pulsarapp

import com.swmansion.pulsarapp.types.Bar
import com.swmansion.pulsarapp.types.Point
import org.junit.Assert.assertEquals
import org.junit.Test

class BarValidUnitTest {
    @Test
    fun ascendingTest() {
        val points = arrayListOf(
            Point(0, 0f),
            Point(1000, 0.5f),
            Point(1000, 0f)
        )

        val lines = convertPointsToLines(points)

        val start = 0L
        val middle1 = 400L
        val middle2 = 500L
        val end = 1000L

        val sharpness = 1f

        // middle
        assertEquals(false, shouldBarBeMerged(Bar(middle1, middle2, 0.2f, sharpness), lines))
        assertEquals(false, shouldBarBeMerged(Bar(middle1, middle2, 0.25f, sharpness), lines))
        assertEquals(true, shouldBarBeMerged(Bar(middle1, middle2, 0.3f, sharpness), lines))

        // start
        assertEquals(false, shouldBarBeMerged(Bar(start, middle2, 0.2f, sharpness), lines))
        assertEquals(false, shouldBarBeMerged(Bar(start, middle2, 0.25f, sharpness), lines))
        assertEquals(true, shouldBarBeMerged(Bar(start, middle2, 0.3f, sharpness), lines))

        // end
        assertEquals(false, shouldBarBeMerged(Bar(middle2, end, 0.2f, sharpness), lines))
        assertEquals(false, shouldBarBeMerged(Bar(middle2, end, 0.5f, sharpness), lines))
        assertEquals(true, shouldBarBeMerged(Bar(middle2, end, 1f, sharpness), lines))
    }

    @Test
    fun descendingTest() {
        val points = arrayListOf(
            Point(0, 0f),
            Point(0, 0.5f),
            Point(1000, 0f)
        )

        val lines = convertPointsToLines(points)

        val start = 0L
        val middle1 = 500L
        val middle2 = 600L
        val end = 1000L

        val sharpness = 1f

        // middle
        assertEquals(false, shouldBarBeMerged(Bar(middle1, middle2, 0.2f, sharpness), lines))
        assertEquals(false, shouldBarBeMerged(Bar(middle1, middle2, 0.25f, sharpness), lines))
        assertEquals(true, shouldBarBeMerged(Bar(middle1, middle2, 0.3f, sharpness), lines))

        // start
        assertEquals(false, shouldBarBeMerged(Bar(start, middle1, 0.2f, sharpness), lines))
        assertEquals(false, shouldBarBeMerged(Bar(start, middle1, 0.5f, sharpness), lines))
        assertEquals(true, shouldBarBeMerged(Bar(start, middle1, 1f, sharpness), lines))

        // end
        assertEquals(false, shouldBarBeMerged(Bar(middle1, end, 0.2f, sharpness), lines))
        assertEquals(false, shouldBarBeMerged(Bar(middle1, end, 0.25f, sharpness), lines))
        assertEquals(true, shouldBarBeMerged(Bar(middle1, end, 0.3f, sharpness), lines))
    }

    @Test
    fun horizontalTest() {
        val points = arrayListOf(
            Point(0, 0f),
            Point(0, 0.5f),
            Point(1000, 0.5f),
            Point(1000, 0f)
        )

        val lines = convertPointsToLines(points)

        val start = 0L
        val middle1 = 200L
        val middle2 = 800L
        val end = 1000L

        val sharpness = 1f

        // middle
        assertEquals(false, shouldBarBeMerged(Bar(middle1, middle2, 0.2f, sharpness), lines))
        assertEquals(false, shouldBarBeMerged(Bar(middle1, middle2, 0.5f, sharpness), lines))
        assertEquals(true, shouldBarBeMerged(Bar(middle1, middle2, 1f, sharpness), lines))

        // start
        assertEquals(false, shouldBarBeMerged(Bar(start, middle2, 0.2f, sharpness), lines))
        assertEquals(false, shouldBarBeMerged(Bar(start, middle2, 0.5f, sharpness), lines))
        assertEquals(true, shouldBarBeMerged(Bar(start, middle2, 1f, sharpness), lines))

        // end
        assertEquals(false, shouldBarBeMerged(Bar(middle2, end, 0.2f, sharpness), lines))
        assertEquals(false, shouldBarBeMerged(Bar(middle2, end, 0.5f, sharpness), lines))
        assertEquals(true, shouldBarBeMerged(Bar(middle2, end, 1f, sharpness), lines))
    }

    @Test
    fun multipleLineOverlapTest() {
        val points = arrayListOf(
            Point(0, 0f),
            Point(300, 0f),
            Point(400, 0.3f),
            Point(500, 0.9f),
            Point(500, 0f),
            Point(600, 0.5f),
            Point(650, 0.5f),
            Point(700, 0f),
            Point(1000, 0f)
        )

        val lines = convertPointsToLines(points)

        val x1 = 200L
        val x2 = 800L
        val sharpness = 1f

        assertEquals(false, shouldBarBeMerged(Bar(x1, x2, 0.2f, sharpness), lines))
        assertEquals(false, shouldBarBeMerged(Bar(x1, x2, 0.3f, sharpness), lines))
        assertEquals(false, shouldBarBeMerged(Bar(x1, x2, 0.5f, sharpness), lines))
        assertEquals(false, shouldBarBeMerged(Bar(x1, x2, 0.9f, sharpness), lines))
        assertEquals(true, shouldBarBeMerged(Bar(x1, x2, 1f, sharpness), lines))
    }

    @Test
    fun verticalTest() {
        val points = arrayListOf(
            Point(0, 0f),
            Point(100, 0.5f),
            Point(200, 0.5f),
            Point(200, 0f),
            Point(300, 0f),
            Point(300, 0.5f),
            Point(400, 0.5f),
            Point(400, 0f),
        )

        val lines = convertPointsToLines(points)

        val x1 = 200L
        val x2 = 250L
        val x3 = 300L
        val sharpness = 1f

        // start
        assertEquals(true, shouldBarBeMerged(Bar(x1, x2, 0.2f, sharpness), lines))
        assertEquals(true, shouldBarBeMerged(Bar(x1, x2, 0.5f, sharpness), lines))
        assertEquals(true, shouldBarBeMerged(Bar(x1, x2, 1f, sharpness), lines))

        // end
        assertEquals(true, shouldBarBeMerged(Bar(x2, x3, 0.2f, sharpness), lines))
        assertEquals(true, shouldBarBeMerged(Bar(x2, x3,0.5f, sharpness), lines))
        assertEquals(true, shouldBarBeMerged(Bar(x2, x3, 1f, sharpness), lines))

        // middle
        assertEquals(true, shouldBarBeMerged(Bar(x1, x3, 0.2f, sharpness), lines))
        assertEquals(true, shouldBarBeMerged(Bar(x1, x3, 0.5f, sharpness), lines))
        assertEquals(true, shouldBarBeMerged(Bar(x1, x3, 1f, sharpness), lines))
    }
}