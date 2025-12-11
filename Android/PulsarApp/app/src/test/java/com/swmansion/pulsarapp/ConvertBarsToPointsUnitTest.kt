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
class ConvertBarsToPointsUnitTest {
  @Test
  fun separatedBarsTest() {
    val bars =
      arrayListOf(
        Bar(100, 200, 0.3f, 1f),
        Bar(300, 500, 0.6f, 0.6f),
        Bar(600, 800, 1f, 0.3f)
      )
      arrayListOf(
        Bar(100, 200, 0.3f, 1f),
        Bar(300, 500, 0.6f, 0.6f),
        Bar(600, 800, 1f, 0.3f)
      )

    val points = convertBarsToPoints(bars)

    val expectedPoints =
      arrayListOf(
        Point(0, 0f),
        Point(100, 0f),
        Point(100, 0.3f),
        Point(200, 0.3f),
        Point(200, 0f),
        Point(300, 0f),
        Point(300, 0.6f),
        Point(500, 0.6f),
        Point(500, 0f),
        Point(600, 0f),
        Point(600, 1f),
        Point(800, 1f),
        Point(800, 0f),
      )

    assertEquals(expectedPoints, points)
  }

  @Test
  fun connectedBarsTest() {
    val bars = arrayListOf(
      Bar(100, 200, 0.3f, 0.8f),
      Bar(200, 300, 0.6f, 0.6f)
    )

    val points = convertBarsToPoints(bars)

    val expectedPoints =
      arrayListOf(
        Point(0, 0f),
        Point(100, 0f),
        Point(100, 0.3f),
        Point(200, 0.3f), // TODO remove duplicates
        Point(200, 0.6f),
        Point(300, 0.6f),
        Point(300, 0f),
      )

    assertEquals(expectedPoints, points)
  }

  @Test
  fun startWithoutPauseTest() {
    val bars = arrayListOf(
      Bar(0, 100, 0.3f, 0.8f)
    )

    val points = convertBarsToPoints(bars)

    val expectedPoints = arrayListOf(
      Point(0, 0f),
      Point(0, 0.3f),
      Point(100, 0.3f),
      Point(100, 0f)
    )

    assertEquals(expectedPoints, points)
  }
}
