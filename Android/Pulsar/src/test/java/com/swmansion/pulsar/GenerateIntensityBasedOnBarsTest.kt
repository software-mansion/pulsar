package com.swmansion.pulsar

import com.swmansion.pulsar.haptics.generatePlotFromBars
import com.swmansion.pulsar.types.Bar
import com.swmansion.pulsar.types.IntensityPoint
import org.junit.Assert.*
import org.junit.Test

class GenerateIntensityBasedOnBarsTest {
  @Test
  fun separatedBarsTest() {
    val bars =
      arrayListOf(
        Bar(100, 200, 0.3f, 1f),
        Bar(300, 500, 0.6f, 0.6f),
        Bar(600, 800, 1f, 0.3f)
      )

    val intensity = generateIntensity(bars)

    val expectedIntensity =
      arrayListOf(
        IntensityPoint(0, 0f),
        IntensityPoint(100, 0f),
        IntensityPoint(100, 0.3f),
        IntensityPoint(200, 0.3f),
        IntensityPoint(200, 0f),
        IntensityPoint(300, 0f),
        IntensityPoint(300, 0.6f),
        IntensityPoint(500, 0.6f),
        IntensityPoint(500, 0f),
        IntensityPoint(600, 0f),
        IntensityPoint(600, 1f),
        IntensityPoint(800, 1f),
        IntensityPoint(800, 0f),
      )

    assertEquals(expectedIntensity, intensity)
  }

  @Test
  fun adjacentBarsTest() {
    val bars = arrayListOf(
      Bar(100, 200, 0.3f, 0.8f),
      Bar(200, 300, 0.6f, 0.6f)
    )

    val intensity = generateIntensity(bars)

    val expectedIntensity =
      arrayListOf(
        IntensityPoint(0, 0f),
        IntensityPoint(100, 0f),
        IntensityPoint(100, 0.3f),
        IntensityPoint(200, 0.3f),
        IntensityPoint(200, 0.6f),
        IntensityPoint(300, 0.6f),
        IntensityPoint(300, 0f),
      )

    assertEquals(expectedIntensity, intensity)
  }

  @Test
  fun startLineWithBarTest() {
    val bars = arrayListOf(Bar(0, 100, 0.3f, 0.8f))

    val intensity = generateIntensity(bars)

    val expectedIntensity =
      arrayListOf(
        IntensityPoint(0, 0f),
        IntensityPoint(0, 0.3f),
        IntensityPoint(100, 0.3f),
        IntensityPoint(100, 0f),
      )

    assertEquals(expectedIntensity, intensity)
  }

  private fun generateIntensity(bars: ArrayList<Bar>): ArrayList<IntensityPoint> {
    val complexPlot = generatePlotFromBars(bars)
    return complexPlot.intensity
  }
}
