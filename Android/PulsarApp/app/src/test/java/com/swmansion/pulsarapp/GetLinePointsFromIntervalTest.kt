package com.swmansion.pulsarapp

import com.swmansion.pulsarapp.types.IntensityPoint
import org.junit.Assert.*
import org.junit.Test

/**
 * Example local unit test, which will execute on the development machine (host).
 *
 * See [testing documentation](http://d.android.com/tools/testing).
 */
class GetLinePointsFromIntervalTest {
  @Test
  fun singleLineTest() {
    val points = arrayListOf(IntensityPoint(0, 0f), IntensityPoint(1000, 1f))

    val start = IntensityPoint(0, 0f)
    val middle1 = IntensityPoint(400, 0f)
    val middle2 = IntensityPoint(800, 0f)
    val end = IntensityPoint(1000, 0f)

    val startLinePoint = IntensityPoint(0, 0f)
    val middle1LinePoint = IntensityPoint(400, 0.4f)
    val middle2LinePoint = IntensityPoint(800, 0.8f)
    val endLinePoint = IntensityPoint(1000, 1f)

    val lines = generateLines(points)

    // start / end
    assertEquals(
      arrayListOf(startLinePoint, middle1LinePoint),
      getLinePointsFromInterval(start, middle1, lines),
    )
    assertEquals(
      arrayListOf(middle2LinePoint, endLinePoint),
      getLinePointsFromInterval(middle2, end, lines),
    )

    // middle
    assertEquals(
      arrayListOf(middle1LinePoint, middle2LinePoint),
      getLinePointsFromInterval(middle1, middle2, lines),
    )
    assertEquals(
      arrayListOf(middle2LinePoint, endLinePoint),
      getLinePointsFromInterval(middle2, end, lines),
    )

    // whole
    assertEquals(
      arrayListOf(startLinePoint, endLinePoint),
      getLinePointsFromInterval(start, end, lines),
    )
  }

  @Test
  fun multipleLinesFromStartTest() {
    val points =
      arrayListOf(
        IntensityPoint(0, 0f),
        IntensityPoint(200, 0.3f),
        IntensityPoint(400, 0.5f),
        IntensityPoint(600, 0.2f),
        IntensityPoint(800, 0.7f),
        IntensityPoint(1000, 0f),
      )

    val lines = generateLines(points)

    val point1 = IntensityPoint(100, 1f)
    val point2 = IntensityPoint(300, 1f)
    val point3 = IntensityPoint(800, 1f)

    val expectedPoints1 = arrayListOf(points[0], IntensityPoint(100, 0.15f))

    val expectedPoints2 = arrayListOf(points[0], points[1], IntensityPoint(300, 0.4f))

    val expectedPoints3 = arrayListOf(points[0], points[1], points[2], points[3], IntensityPoint(800, 0.7f))

    assertEquals(expectedPoints1, getLinePointsFromInterval(points[0], point1, lines))
    assertEquals(expectedPoints2, getLinePointsFromInterval(points[0], point2, lines))
    assertEquals(expectedPoints3, getLinePointsFromInterval(points[0], point3, lines))
  }

  @Test
  fun multipleLinesFromEndTest() {
    val points =
      arrayListOf(
        IntensityPoint(0, 0f),
        IntensityPoint(200, 0.3f),
        IntensityPoint(400, 0.5f),
        IntensityPoint(600, 0.2f),
        IntensityPoint(800, 0.7f),
        IntensityPoint(1000, 0f),
      )

    val lines = generateLines(points)

    val point1 = IntensityPoint(100, 1f)
    val point2 = IntensityPoint(300, 1f)
    val point3 = IntensityPoint(800, 1f)

    val expectedPoints1 =
      arrayListOf(IntensityPoint(100, 0.15f), points[1], points[2], points[3], points[4], points[5])

    val expectedPoints2 = arrayListOf(IntensityPoint(300, 0.4f), points[2], points[3], points[4], points[5])

    val expectedPoints3 = arrayListOf(points[4], points[5])

    assertEquals(expectedPoints1, getLinePointsFromInterval(point1, points[5], lines))
    assertEquals(expectedPoints2, getLinePointsFromInterval(point2, points[5], lines))
    assertEquals(expectedPoints3, getLinePointsFromInterval(point3, points[5], lines))
  }

  @Test
  fun verticalLineStartEndTest() {
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

    val start = IntensityPoint(200L, 1f)
    val middle = IntensityPoint(250L, 1f)
    val end = IntensityPoint(300L, 1f)

    val startLinePoint = points[3]
    val middleLinePoint = IntensityPoint(250, 0f)
    val endLinePoint = points[4]

    assertEquals(
      arrayListOf(startLinePoint, middleLinePoint),
      getLinePointsFromInterval(start, middle, lines),
    )
    assertEquals(
      arrayListOf(middleLinePoint, endLinePoint),
      getLinePointsFromInterval(middle, end, lines),
    )
    assertEquals(
      arrayListOf(startLinePoint, endLinePoint),
      getLinePointsFromInterval(start, end, lines),
    )
  }

  @Test
  fun multipleVerticalAndHorizontalLineTest() {
    val points =
      arrayListOf(
        IntensityPoint(0, 0f),
        IntensityPoint(100, 0f),
        IntensityPoint(100, 0.5f),
        IntensityPoint(200, 0.5f),
        IntensityPoint(200, 1f),
        IntensityPoint(300, 1f),
        IntensityPoint(300, 0f),
        IntensityPoint(400, 0f),
      )

    val lines = generateLines(points)

    val point1 = IntensityPoint(80, 1f)
    val point2 = IntensityPoint(300, 0.2f)

    val expectedPoints =
      arrayListOf(IntensityPoint(80, 0f), points[1], points[2], points[3], points[4], points[5])

    assertEquals(expectedPoints, getLinePointsFromInterval(point1, point2, lines))
  }
}
