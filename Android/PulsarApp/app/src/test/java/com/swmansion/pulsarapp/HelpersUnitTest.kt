package com.swmansion.pulsarapp

import com.swmansion.pulsarapp.types.Bar
import com.swmansion.pulsarapp.types.Line
import com.swmansion.pulsarapp.types.Point
import org.junit.Assert.assertEquals
import org.junit.Test

class HelpersUnitTest {
  @Test
  fun convertPointToLinesTest() {
    val point1 = Point(0, 0f)
    val point2 = Point(0, 0.5f)
    val point3 = Point(100, 0.5f)
    val point4 = Point(100, 0.2f)
    val point5 = Point(300, 0.2f)
    val point6 = Point(300, 0.3f)
    val point7 = Point(1000, 0.3f)
    val point8 = Point(1000, 0f)

    val points = arrayListOf(point1, point2, point3, point4, point5, point6, point7, point8)

    val lines = convertPointsToLines(points)

    val expectedLines =
      arrayListOf(
        Line(point1, point2),
        Line(point2, point3),
        Line(point3, point4),
        Line(point4, point5),
        Line(point5, point6),
        Line(point6, point7),
        Line(point7, point8),
      )

    assertEquals(expectedLines, lines)
  }
}
