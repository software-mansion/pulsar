package com.swmansion.pulsarapp

import com.swmansion.pulsarapp.types.Bar
import com.swmansion.pulsarapp.types.IntensityPoint
import org.junit.Assert.assertEquals
import org.junit.Test

class ShouldBarBeMergedTest {
  @Test
  fun singleIntervalAscendingTest() {
    val intensity =
        arrayListOf(
            IntensityPoint(0, 0f),
            IntensityPoint(1000, 0.5f),
            IntensityPoint(1000, 0f)
        )

    val lines = generateLines(intensity)

    val start = 0L
    val middle1 = 400L
    val middle2 = 500L
    val end = 1000L

    // middle
    assertEquals(false, shouldBarBeMerged(Bar(middle1, middle2, 0.2f, DEFAULT_SHARPNESS), lines))
    assertEquals(false, shouldBarBeMerged(Bar(middle1, middle2, 0.25f, DEFAULT_SHARPNESS), lines))
    assertEquals(true, shouldBarBeMerged(Bar(middle1, middle2, 0.3f, DEFAULT_SHARPNESS), lines))

    // start
    assertEquals(false, shouldBarBeMerged(Bar(start, middle2, 0.2f, DEFAULT_SHARPNESS), lines))
    assertEquals(false, shouldBarBeMerged(Bar(start, middle2, 0.25f, DEFAULT_SHARPNESS), lines))
    assertEquals(true, shouldBarBeMerged(Bar(start, middle2, 0.3f, DEFAULT_SHARPNESS), lines))

    // end
    assertEquals(false, shouldBarBeMerged(Bar(middle2, end, 0.2f, DEFAULT_SHARPNESS), lines))
    assertEquals(false, shouldBarBeMerged(Bar(middle2, end, 0.5f, DEFAULT_SHARPNESS), lines))
    assertEquals(true, shouldBarBeMerged(Bar(middle2, end, 1f, DEFAULT_SHARPNESS), lines))
  }

  @Test
  fun singleIntervalDescendingTest() {
    val intensity =
        arrayListOf(
            IntensityPoint(0, 0f),
            IntensityPoint(0, 0.5f),
            IntensityPoint(1000, 0f)
        )

    val lines = generateLines(intensity)

    val start = 0L
    val middle1 = 500L
    val middle2 = 600L
    val end = 1000L

    // middle
    assertEquals(false, shouldBarBeMerged(Bar(middle1, middle2, 0.2f, DEFAULT_SHARPNESS), lines))
    assertEquals(false, shouldBarBeMerged(Bar(middle1, middle2, 0.25f, DEFAULT_SHARPNESS), lines))
    assertEquals(true, shouldBarBeMerged(Bar(middle1, middle2, 0.3f, DEFAULT_SHARPNESS), lines))

    // start
    assertEquals(false, shouldBarBeMerged(Bar(start, middle1, 0.2f, DEFAULT_SHARPNESS), lines))
    assertEquals(false, shouldBarBeMerged(Bar(start, middle1, 0.5f, DEFAULT_SHARPNESS), lines))
    assertEquals(true, shouldBarBeMerged(Bar(start, middle1, 1f, DEFAULT_SHARPNESS), lines))

    // end
    assertEquals(false, shouldBarBeMerged(Bar(middle1, end, 0.2f, DEFAULT_SHARPNESS), lines))
    assertEquals(false, shouldBarBeMerged(Bar(middle1, end, 0.25f, DEFAULT_SHARPNESS), lines))
    assertEquals(true, shouldBarBeMerged(Bar(middle1, end, 0.3f, DEFAULT_SHARPNESS), lines))
  }

  @Test
  fun singleIntervalHorizontalTest() {
    val intensity =
        arrayListOf(
            IntensityPoint(0, 0f),
            IntensityPoint(0, 0.5f),
            IntensityPoint(1000, 0.5f),
            IntensityPoint(1000, 0f)
        )

    val lines = generateLines(intensity)

    val start = 0L
    val middle1 = 200L
    val middle2 = 800L
    val end = 1000L

    // middle
    assertEquals(false, shouldBarBeMerged(Bar(middle1, middle2, 0.2f, DEFAULT_SHARPNESS), lines))
    assertEquals(false, shouldBarBeMerged(Bar(middle1, middle2, 0.5f, DEFAULT_SHARPNESS), lines))
    assertEquals(true, shouldBarBeMerged(Bar(middle1, middle2, 1f, DEFAULT_SHARPNESS), lines))

    // start
    assertEquals(false, shouldBarBeMerged(Bar(start, middle2, 0.2f, DEFAULT_SHARPNESS), lines))
    assertEquals(false, shouldBarBeMerged(Bar(start, middle2, 0.5f, DEFAULT_SHARPNESS), lines))
    assertEquals(true, shouldBarBeMerged(Bar(start, middle2, 1f, DEFAULT_SHARPNESS), lines))

    // end
    assertEquals(false, shouldBarBeMerged(Bar(middle2, end, 0.2f, DEFAULT_SHARPNESS), lines))
    assertEquals(false, shouldBarBeMerged(Bar(middle2, end, 0.5f, DEFAULT_SHARPNESS), lines))
    assertEquals(true, shouldBarBeMerged(Bar(middle2, end, 1f, DEFAULT_SHARPNESS), lines))
  }

  @Test
  fun multipleIntervalsTest() {
    val intensity =
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

    val lines = generateLines(intensity)

    val x1 = 200L
    val x2 = 800L

    assertEquals(false, shouldBarBeMerged(Bar(x1, x2, 0.2f, DEFAULT_SHARPNESS), lines))
    assertEquals(false, shouldBarBeMerged(Bar(x1, x2, 0.3f, DEFAULT_SHARPNESS), lines))
    assertEquals(false, shouldBarBeMerged(Bar(x1, x2, 0.5f, DEFAULT_SHARPNESS), lines))
    assertEquals(false, shouldBarBeMerged(Bar(x1, x2, 0.9f, DEFAULT_SHARPNESS), lines))
    assertEquals(true, shouldBarBeMerged(Bar(x1, x2, 0.91f, DEFAULT_SHARPNESS), lines))
    assertEquals(true, shouldBarBeMerged(Bar(x1, x2, 1f, DEFAULT_SHARPNESS), lines))
  }

  @Test
  fun verticalAdjacentLineOutsideTest() {
    val intensity =
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

    val lines = generateLines(intensity)

    val start = 200L
    val middle = 250L
    val end = 300L

    // start
    assertEquals(true, shouldBarBeMerged(Bar(start, middle, 0.2f, DEFAULT_SHARPNESS), lines))
    assertEquals(true, shouldBarBeMerged(Bar(start, middle, 0.5f, DEFAULT_SHARPNESS), lines))
    assertEquals(true, shouldBarBeMerged(Bar(start, middle, 1f, DEFAULT_SHARPNESS), lines))

    // end
    assertEquals(true, shouldBarBeMerged(Bar(middle, end, 0.2f, DEFAULT_SHARPNESS), lines))
    assertEquals(true, shouldBarBeMerged(Bar(middle, end, 0.5f, DEFAULT_SHARPNESS), lines))
    assertEquals(true, shouldBarBeMerged(Bar(middle, end, 1f, DEFAULT_SHARPNESS), lines))

    // middle
    assertEquals(true, shouldBarBeMerged(Bar(start, end, 0.2f, DEFAULT_SHARPNESS), lines))
    assertEquals(true, shouldBarBeMerged(Bar(start, end, 0.5f, DEFAULT_SHARPNESS), lines))
    assertEquals(true, shouldBarBeMerged(Bar(start, end, 1f, DEFAULT_SHARPNESS), lines))
  }
}
