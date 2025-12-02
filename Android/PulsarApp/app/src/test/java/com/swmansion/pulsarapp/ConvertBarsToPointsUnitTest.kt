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

    val points = convertBarsToPoints(bars)

    val expectedPoints: ArrayList<Point> =
      arrayListOf(
        Point(0f, 1f, 0),
        Point(0f, 1f, 100),
        Point(0.3f, 1f, 100),
        Point(0.3f, 1f, 200),
        Point(0f, 1f, 200),
        Point(0f, 1f, 300),
        Point(0.6f, 0.6f, 300),
        Point(0.6f, 0.6f, 500),
        Point(0f, 0.6f, 500),
        Point(0f, 0.6f, 600),
        Point(1f, 0.3f, 600),
        Point(1f, 0.3f, 800),
        Point(0f, 0.3f, 800),
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

    val expectedPoints: ArrayList<Point> =
      arrayListOf(
        Point(0f, 0.8f, 0),
        Point(0f, 0.8f, 100),
        Point(0.3f, 0.8f, 100),
        Point(0.3f, 0.8f, 200),
        Point(0.6f, 0.6f, 200),
        Point(0.6f, 0.6f, 300),
        Point(0f, 0.6f, 300),
      )

    assertEquals(expectedPoints, points)
  }

  @Test
  fun startWith0Test() {
    val bars = arrayListOf(
      Bar(0, 200, 0.3f, 0.8f)
    )

    val points = convertBarsToPoints(bars)

    val expectedPoints: ArrayList<Point> =
      arrayListOf(
        Point(0f, 0.8f, 0),
        Point(0.3f, 0.8f, 0),
        Point(0.3f, 0.8f, 200),
        Point(0f, 0.8f, 200),
      )

    assertEquals(expectedPoints, points)
  }
}
