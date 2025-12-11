package com.swmansion.pulsarapp

import com.swmansion.pulsarapp.types.Point
import org.junit.Assert.*
import org.junit.Test

/**
 * Example local unit test, which will execute on the development machine (host).
 *
 * See [testing documentation](http://d.android.com/tools/testing).
 */
class GetLinePointsFromIntervalTest {
  @Test
  fun wholeBarInsideLineTest() {
    val points = arrayListOf(
      Point(0, 0f),
      Point(300, 0f)
    )

    val point1 = Point(0, 0f)
    val point2 = Point(100, 0f)
    val point3 = Point(200, 0f)
    val point4 = Point(300, 0f)

    val lines = convertPointsToLines(points)

    // edge
    assertEquals(arrayListOf(point1, point2), getLinePointsFromInterval(point1, point2, lines))
    assertEquals(arrayListOf(point3, point4), getLinePointsFromInterval(point3, point4, lines))

    // middle
    assertEquals(arrayListOf(point2, point3), getLinePointsFromInterval(point2, point3, lines))
    assertEquals(arrayListOf(point3, point4), getLinePointsFromInterval(point3, point4, lines))

    // whole
    assertEquals(arrayListOf(point1, point4), getLinePointsFromInterval(point1, point4, lines))
  }

  @Test
  fun startLinesWithBarTest() {
    val points =
      arrayListOf(
        Point(0, 0f),
        Point(200, 0f),
        Point(400, 0f),
        Point(600, 0f),
        Point(800, 0f),
        Point(1000, 0f),
      )

    val lines = convertPointsToLines(points)

    val point1 = Point(100, 1f)
    val point2 = Point(250, 1f)
    val point3 = Point(800, 1f)

    val expectedPoints1 = arrayListOf(
      points[0],
      Point(100, 0f)
    )

    val expectedPoints2 = arrayListOf(
      points[0],
      points[1],
      Point(250, 0f)
    )

    val expectedPoints3 =
      arrayListOf(
        points[0],
        points[1],
        points[2],
        points[3],
        Point(800, 0f)
      )

    assertEquals(expectedPoints1, getLinePointsFromInterval(points[0], point1, lines))
    assertEquals(expectedPoints2, getLinePointsFromInterval(points[0], point2, lines))
    assertEquals(expectedPoints3, getLinePointsFromInterval(points[0], point3, lines))
  }

  @Test
  fun endLinesWithBarTest() {
    val points =
      arrayListOf(
        Point(0, 0f),
        Point(200, 0f),
        Point(400, 0f),
        Point(600, 0f),
        Point(800, 0f),
        Point(1000, 0f),
      )

    val lines = convertPointsToLines(points)

    val point1 = Point(100, 1f)
    val point2 = Point(250, 1f)
    val point3 = Point(800, 1f)

    val expectedPoints1 =
      arrayListOf(
        Point(100, 0f),
        points[1],
        points[2],
        points[3],
        points[4],
        points[5],
      )

    val expectedPoints2 =
      arrayListOf(
        Point(250, 0f),
        points[2],
        points[3],
        points[4],
        points[5],
      )

    val expectedPoints3 = arrayListOf(
      points[4],
      points[5],
    )

    assertEquals(expectedPoints1, getLinePointsFromInterval(point1, points[5], lines))
    assertEquals(expectedPoints2, getLinePointsFromInterval(point2, points[5], lines))
    assertEquals(expectedPoints3, getLinePointsFromInterval(point3, points[5], lines))
  }

//  @Test
//  fun verticalLineTest() {
//    val points =
//      arrayListOf(
//        Point(0, 0f),
//        Point(100, 0f),
//        Point(100, 0.5f),
//        Point(200, 0.5f),
//        Point(200, 1f),
//        Point(300, 1f),
//        Point(300, 0f),
//        Point(0, 400f),
//      )
//
//    val lines = convertPointsToLines(points)
//
//    val verticalStartPoint = Point(100, 0f)
//    val verticalMiddlePoint = Point(100, 0.25f)
//    val verticalEndPoint = Point(100, 0.5f)
//
//    val horizontalStartPoint = verticalEndPoint
//    val horizontalMiddlePoint = Point(150, 0.5f)
//    val horizontalEndPoint = Point(200, 0.5f)
//
//    // horizontal + horizontal
////    assertEquals(
////      arrayListOf(horizontalStartPoint, horizontalMiddlePoint),
////      getLinePointsFromInterval(horizontalStartPoint, horizontalMiddlePoint, lines),
////    )
////    assertEquals(
////      arrayListOf(horizontalMiddlePoint, horizontalEndPoint),
////      getLinePointsFromInterval(horizontalMiddlePoint, horizontalEndPoint, lines),
////    )
//
//    // vertical + vertical
//    assertEquals(
//      arrayListOf(verticalStartPoint, verticalMiddlePoint),
//      getLinePointsFromInterval(verticalStartPoint, verticalMiddlePoint, lines),
//    )
//    assertEquals(
//      arrayListOf(verticalMiddlePoint, verticalEndPoint),
//      getLinePointsFromInterval(verticalMiddlePoint, verticalEndPoint, lines),
//    )
//
//    // vertical + horizontal
//    assertEquals(
//      arrayListOf(verticalStartPoint, verticalEndPoint, horizontalMiddlePoint),
//      getLinePointsFromInterval(verticalStartPoint, horizontalMiddlePoint, lines),
//    )
//    assertEquals(
//      arrayListOf(verticalMiddlePoint, verticalEndPoint, horizontalMiddlePoint),
//      getLinePointsFromInterval(verticalMiddlePoint, horizontalMiddlePoint, lines),
//    )
//    assertEquals(
//      arrayListOf(verticalEndPoint, horizontalMiddlePoint),
//      getLinePointsFromInterval(verticalEndPoint, horizontalMiddlePoint, lines),
//    )
//  }

//  @Test
//  fun verticalAndHorizontalTest() {
//    val points =
//      arrayListOf(
//        Point(0, 0f),
//        Point(100, 0f),
//        Point(100, 0.5f),
//        Point(200, 0.5f),
//        Point(200, 1f),
//        Point(300, 1f),
//        Point(300, 0f),
//        Point(0, 400f),
//      )
//
//    val lines = convertPointsToLines(points)
//
//    val verticalStartPoint = Point(100, 0f)
//    val verticalMiddlePoint = Point(100, 0.25f)
//    val verticalEndPoint = Point(100, 0.5f)
//
//    val horizontalStartPoint = verticalEndPoint
//    val horizontalMiddlePoint = Point(150, 0.5f)
//    val horizontalEndPoint = Point(200, 0.5f)
//
//    // horizontal + horizontal - juz jest taki test
//    assertEquals(
//      arrayListOf(horizontalStartPoint, horizontalMiddlePoint),
//      getLinePointsFromInterval(horizontalStartPoint, horizontalMiddlePoint, lines),
//    )
//    assertEquals(
//      arrayListOf(horizontalMiddlePoint, horizontalEndPoint),
//      getLinePointsFromInterval(horizontalMiddlePoint, horizontalEndPoint, lines),
//    )
//
//    // vertical + vertical
//    assertEquals(
//      arrayListOf(verticalStartPoint, verticalMiddlePoint),
//      getLinePointsFromInterval(verticalStartPoint, verticalMiddlePoint, lines),
//    )
//    assertEquals(
//      arrayListOf(verticalMiddlePoint, verticalEndPoint),
//      getLinePointsFromInterval(verticalMiddlePoint, verticalEndPoint, lines),
//    )
//
//    // vertical + horizontal
//    assertEquals(
//      arrayListOf(verticalStartPoint, verticalEndPoint, horizontalMiddlePoint),
//      getLinePointsFromInterval(verticalStartPoint, horizontalMiddlePoint, lines),
//    )
//    assertEquals(
//      arrayListOf(verticalMiddlePoint, verticalEndPoint, horizontalMiddlePoint),
//      getLinePointsFromInterval(verticalMiddlePoint, horizontalMiddlePoint, lines),
//    )
//    assertEquals(
//      arrayListOf(verticalEndPoint, horizontalMiddlePoint),
//      getLinePointsFromInterval(verticalEndPoint, horizontalMiddlePoint, lines),
//    )
//  }

  @Test
  fun multipleVerticalAndHorizontalLineTest() {
    val points =
      arrayListOf(
        Point(0, 0f),
        Point(100, 0f),
        Point(100, 0.5f),
        Point(200, 0.5f),
        Point(200, 1f),
        Point(300, 1f),
        Point(300, 0f),
        Point(400, 0f),
      )

    val lines = convertPointsToLines(points)

    val point1 = Point(80, 1f)
    val point2 = Point(300, 0.2f)

    val expectedPoints =
      arrayListOf(
        Point(80, 0f),
        points[1],
        points[2],
        points[3],
        points[4],
        points[5],
        // TODO handle vertical missing point
      )

    assertEquals(expectedPoints, getLinePointsFromInterval(point1, point2, lines))
  }
}
