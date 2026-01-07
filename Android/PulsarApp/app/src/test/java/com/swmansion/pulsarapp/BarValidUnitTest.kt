package com.swmansion.pulsarapp

import com.swmansion.pulsarapp.types.Bar
import com.swmansion.pulsarapp.types.IntensityPoint
import org.junit.Assert.assertEquals
import org.junit.Test

class BarValidUnitTest {
  @Test
  fun singleIntervalAscendingTest() {
    val points =
        arrayListOf(
            IntensityPoint(0, 0f),
            IntensityPoint(1000, 0.5f),
            IntensityPoint(1000, 0f)
        )

    val lines = generateLines(points)

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
  fun singleIntervalDescendingTest() {
    val points =
        arrayListOf(
            IntensityPoint(0, 0f),
            IntensityPoint(0, 0.5f),
            IntensityPoint(1000, 0f)
        )

    val lines = generateLines(points)

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
  fun singleIntervalHorizontalTest() {
    val points =
        arrayListOf(
            IntensityPoint(0, 0f),
            IntensityPoint(0, 0.5f),
            IntensityPoint(1000, 0.5f),
            IntensityPoint(1000, 0f)
        )

    val lines = generateLines(points)

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
  fun multipleIntervalsTest() {
    val points =
      arrayListOf(
        IntensityPoint(0, 0f),
        IntensityPoint(300, 0f),
        IntensityPoint(400, 0.3f),
        IntensityPoint(500, 0.9f),
        IntensityPoint(500, 0f),
        IntensityPoint(600, 0.5f),
        IntensityPoint(650, 0.5f),
        IntensityPoint(700, 0f),
        IntensityPoint(1000, 0f),
      )

    val lines = generateLines(points)

    val x1 = 200L
    val x2 = 800L
    val sharpness = 1f

    assertEquals(false, shouldBarBeMerged(Bar(x1, x2, 0.2f, sharpness), lines))
    assertEquals(false, shouldBarBeMerged(Bar(x1, x2, 0.3f, sharpness), lines))
    assertEquals(false, shouldBarBeMerged(Bar(x1, x2, 0.5f, sharpness), lines))
    assertEquals(false, shouldBarBeMerged(Bar(x1, x2, 0.9f, sharpness), lines))
    assertEquals(true, shouldBarBeMerged(Bar(x1, x2, 0.91f, sharpness), lines))
    assertEquals(true, shouldBarBeMerged(Bar(x1, x2, 1f, sharpness), lines))
  }

  @Test
  fun verticalAdjacentLineOutsideTest() {
    val points =
      arrayListOf(
        IntensityPoint(0, 0f),
        IntensityPoint(100, 0.5f),
        IntensityPoint(200, 0.5f),
        IntensityPoint(200, 0f),
        IntensityPoint(300, 0f),
        IntensityPoint(300, 0.5f),
        IntensityPoint(400, 0.5f),
        IntensityPoint(400, 0f),
      )

    val lines = generateLines(points)

    val start = 200L
    val middle = 250L
    val end = 300L

    val sharpness = 1f

    // start
    assertEquals(true, shouldBarBeMerged(Bar(start, middle, 0.2f, sharpness), lines))
    assertEquals(true, shouldBarBeMerged(Bar(start, middle, 0.5f, sharpness), lines))
    assertEquals(true, shouldBarBeMerged(Bar(start, middle, 1f, sharpness), lines))

    // end
    assertEquals(true, shouldBarBeMerged(Bar(middle, end, 0.2f, sharpness), lines))
    assertEquals(true, shouldBarBeMerged(Bar(middle, end, 0.5f, sharpness), lines))
    assertEquals(true, shouldBarBeMerged(Bar(middle, end, 1f, sharpness), lines))

    // middle
    assertEquals(true, shouldBarBeMerged(Bar(start, end, 0.2f, sharpness), lines))
    assertEquals(true, shouldBarBeMerged(Bar(start, end, 0.5f, sharpness), lines))
    assertEquals(true, shouldBarBeMerged(Bar(start, end, 1f, sharpness), lines))
  }
}
