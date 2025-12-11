package com.swmansion.pulsarapp

import com.swmansion.pulsarapp.types.Bar
import com.swmansion.pulsarapp.types.Point
import org.junit.Assert.*
import org.junit.Test

/**
 * Example local unit test, which will execute on the development machine (host).
 *
 * See [testing documentation](http://d.android.com/tools/testing).
 */
class MergeBarsAndPointsUnitTest {
  @Test
  fun horizontalTest() {
    val bars =
      arrayListOf(
        Bar(0, 100, 1f, 1f), // beginning
        Bar(200, 300, 1f, 1f), // middle
        Bar(400, 500, 1f, 1f), // end
      )

    val points = arrayListOf(
      Point(0, 0f),
      Point(0, 0.2f),
      Point(500, 0.2f),
      Point(500, 0f)
    )

    val expectedResults =
      arrayListOf(
        Point(0, 0f),
        Point(0, 1f),
        Point(100, 1f),
        Point(100, 0.2f),
        Point(200, 0.2f),
        Point(200, 1f),
        Point(300, 1f),
        Point(300, 0.2f),
        Point(400, 0.2f),
        Point(400, 1f),
        Point(500, 1f),
        Point(500, 0f),
      )

    assertEquals(expectedResults, mergePointsAndBars(points, bars))
  }

  //  fun barOverlapptingMultipleLinesTest

  @Test
  fun commonBarRelativeTimeTest() {
    val bars =
      arrayListOf(
        Bar(50, 100, 1f, 1f),
        Bar(100, 150, 0.8f, 1f),
        Bar(200, 250, 0.8f, 1f),
        Bar(250, 300, 1f, 1f),
        Bar(300, 350, 0.8f, 1f),
      )

    val points = arrayListOf(
      Point(0, 0f),
      Point(0, 0.2f),
      Point(500, 0.2f),
      Point(500, 0f)
    )

    val expectedResults =
      arrayListOf(
        Point(0, 0f),
        Point(0, 0.2f),
        Point(50, 0.2f),
        Point(50, 1f),
        Point(100, 1f),
        Point(100, 0.8f),
        Point(150, 0.8f),
        Point(150, 0.2f),
        Point(200, 0.2f),
        Point(200, 0.8f),
        Point(250, 0.8f),
        Point(250, 1f),
        Point(300, 1f),
        Point(300, 0.8f),
        Point(350, 0.8f),
        Point(350, 0.2f),
        Point(500, 0.2f),
        Point(500, 0f),
      )

    assertEquals(expectedResults, mergePointsAndBars(points, bars))
  }

  @Test
  fun deleteRedundantLinePointsTest() {
    val bars =
      arrayListOf(
        Bar(50, 100, 1f, 1f),
        Bar(100, 150, 1f, 1f),
        Bar(200, 250, 1f, 1f),
        Bar(250, 300, 1f, 1f),
        Bar(300, 350, 1f, 1f),
        Bar(350, 400, 1f, 1f),
      )

    val points = arrayListOf(
      Point(0, 0f),
      Point(0, 0.2f),
      Point(500, 0.2f),
      Point(500, 0f)
    )

    val expectedResults =
      arrayListOf(
        Point(0, 0f),
        Point(0, 0.2f),
        Point(50, 0.2f),
        Point(50, 1f),
        Point(150, 1f),
        Point(150, 0.2f),
        Point(200, 0.2f),
        Point(200, 1f),
        Point(400, 1f),
        Point(400, 0.2f),
        Point(500, 0.2f),
        Point(500, 0f),
      )

    assertEquals(expectedResults, mergePointsAndBars(points, bars))
  }

  // TODO ?
  @Test
  fun differentFrequencyEdgeTest() {
    val bars = arrayListOf(
      Bar(400, 500, 1f, 1f),
      Bar(500, 600, 0.8f, 1f)
    )

    val points =
      arrayListOf(
        Point(0, 0f),
        Point(0, 0.2f),
        Point(500, 0.2f),
        Point(1000, 1f),
        Point(1000, 0f)
      )

    val expectedResults =
      arrayListOf(
        Point(0, 0f),
        Point(0, 0.2f),
        Point(400, 0.2f),
        Point(400, 1f),
        Point(500, 1f),
        Point(500, 0.8f),
        Point(600, 0.8f),
        Point(600, 0.36f),
        Point(1000, 1f),
        Point(1000, 0f),
      )

    assertEquals(expectedResults, mergePointsAndBars(points, bars))
  }

  // TODO ?
  @Test
  fun sameFrequencyEdgeTest() {
    val bars = arrayListOf(
      Bar(400, 500, 1f, 1f),
      Bar(500, 600, 1f, 1f)
    )

    val points =
      arrayListOf(
        Point(0, 0f),
        Point(0, 0.2f),
        Point(500, 0.2f),
        Point(1000, 1f),
        Point(1000, 0f)
      )

    val expectedResults =
      arrayListOf(
        Point(0, 0f),
        Point(0, 0.2f),
        Point(400, 0.2f),
        Point(400, 1f),
        Point(600, 1f),
        Point(600, 0.36f),
        Point(1000, 1f),
        Point(1000, 0f),
      )

    assertEquals(expectedResults, mergePointsAndBars(points, bars))
  }
}
