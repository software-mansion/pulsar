package com.swmansion.pulsar

import com.swmansion.pulsar.haptics.convertIntensityToLines
import com.swmansion.pulsar.haptics.getIntensityFromInterval
import com.swmansion.pulsar.types.IntensityPoint
import org.junit.Assert.*
import org.junit.Test

class GetIntensityFromIntervalTest {
  @Test
  fun singleLineTest() {
    val intensity =
      arrayListOf(
        IntensityPoint(0, 0f),
        IntensityPoint(1000, 1f)
      )

    val startTime = 0L
    val middleTime1 = 400L
    val middleTime2 = 800L
    val endTime = 1000L

    val startLinePoint = intensity.first()
    val middle1LinePoint = IntensityPoint(middleTime1, 0.4f)
    val middle2LinePoint = IntensityPoint(middleTime2, 0.8f)
    val endLinePoint = intensity.last()

    val lines = convertIntensityToLines(intensity)

    // start / end
    assertEquals(
      arrayListOf(startLinePoint, middle1LinePoint),
        getIntensityFromInterval(startTime, middleTime1, lines),
    )
    assertEquals(
      arrayListOf(middle2LinePoint, endLinePoint),
        getIntensityFromInterval(middleTime2, endTime, lines),
    )

    // middle
    assertEquals(
      arrayListOf(middle1LinePoint, middle2LinePoint),
        getIntensityFromInterval(middleTime1, middleTime2, lines),
    )
    assertEquals(
      arrayListOf(middle2LinePoint, endLinePoint),
        getIntensityFromInterval(middleTime2, endTime, lines),
    )

    // whole
    assertEquals(
      arrayListOf(startLinePoint, endLinePoint),
        getIntensityFromInterval(startTime, endTime, lines),
    )
  }

  @Test
  fun multipleLinesFromStartTest() {
    val intensity =
      arrayListOf(
        IntensityPoint(0, 0f),
        IntensityPoint(200, 0.3f),
        IntensityPoint(400, 0.5f),
        IntensityPoint(600, 0.2f),
        IntensityPoint(800, 0.7f),
        IntensityPoint(1000, 0f),
      )

    val lines = convertIntensityToLines(intensity)

    val pointTime1 = 100L
    val pointTime2 = 300L
    val pointTime3 = 800L

    val expectedIntensity1 = arrayListOf(intensity[0], IntensityPoint(pointTime1, 0.15f))
    val expectedIntensity2 =
      arrayListOf(intensity[0], intensity[1], IntensityPoint(pointTime2, 0.4f))
    val expectedIntensity3 =
      arrayListOf(intensity[0], intensity[1], intensity[2], intensity[3], intensity[4])

    assertEquals(expectedIntensity1, getIntensityFromInterval(0, pointTime1, lines))
    assertEquals(expectedIntensity2, getIntensityFromInterval(0, pointTime2, lines))
    assertEquals(expectedIntensity3, getIntensityFromInterval(0, pointTime3, lines))
  }

  @Test
  fun multipleLinesFromEndTest() {
    val intensity =
      arrayListOf(
        IntensityPoint(0, 0f),
        IntensityPoint(200, 0.3f),
        IntensityPoint(400, 0.5f),
        IntensityPoint(600, 0.2f),
        IntensityPoint(800, 0.7f),
        IntensityPoint(1000, 0f),
      )

    val lines = convertIntensityToLines(intensity)

    val pointTime1 = 100L
    val pointTime2 = 300L
    val pointTime3 = 800L

    val endRelativeTime = intensity.last().relativeTime

    val expectedIntensity1 =
      arrayListOf(
        IntensityPoint(pointTime1, 0.15f),
        intensity[1],
        intensity[2],
        intensity[3],
        intensity[4],
        intensity[5],
      )
    val expectedIntensity2 =
      arrayListOf(
        IntensityPoint(pointTime2, 0.4f),
        intensity[2],
        intensity[3],
        intensity[4],
        intensity[5],
      )
    val expectedIntensity3 = arrayListOf(intensity[4], intensity[5])

    assertEquals(expectedIntensity1, getIntensityFromInterval(pointTime1, endRelativeTime, lines))
    assertEquals(expectedIntensity2, getIntensityFromInterval(pointTime2, endRelativeTime, lines))
    assertEquals(expectedIntensity3, getIntensityFromInterval(pointTime3, endRelativeTime, lines))
  }

  @Test
  fun verticalLineStartEndTest() {
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

    val lines = convertIntensityToLines(intensity)

    val startTime = 200L
    val middleTime = 250L
    val endTime = 300L

    val startLinePoint = intensity[3]
    val middleLinePoint = IntensityPoint(middleTime, 0f)
    val endLinePoint = intensity[4]

    assertEquals(
      arrayListOf(startLinePoint, middleLinePoint),
        getIntensityFromInterval(startTime, middleTime, lines),
    )
    assertEquals(
      arrayListOf(middleLinePoint, endLinePoint),
        getIntensityFromInterval(middleTime, endTime, lines),
    )
    assertEquals(
      arrayListOf(startLinePoint, endLinePoint),
        getIntensityFromInterval(startTime, endTime, lines),
    )
  }

  @Test
  fun multipleVerticalAndHorizontalLinesTest() {
    val intensity =
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

    val lines = convertIntensityToLines(intensity)

    val pointTime1 = 80L
    val pointTime2 = 300L

    val expectedIntensity =
      arrayListOf(
        IntensityPoint(pointTime1, 0f),
        intensity[1],
        intensity[2],
        intensity[3],
        intensity[4],
        intensity[5],
      )

    assertEquals(expectedIntensity, getIntensityFromInterval(pointTime1, pointTime2, lines))
  }
}
