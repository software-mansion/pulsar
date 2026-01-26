package com.swmansion.pulsar

import com.swmansion.pulsar.haptics.generateComplexPlot
import com.swmansion.pulsar.haptics.generatePlotPoints
import com.swmansion.pulsar.types.Bar
import com.swmansion.pulsar.types.IntensityPoint
import com.swmansion.pulsar.types.PlotPoint
import com.swmansion.pulsar.types.SharpnessPoint
import org.junit.Assert.assertEquals
import org.junit.Test

class GeneratePlotPointsTest {
  @Test
  fun withoutBarsTest() {
    val intensity =
      arrayListOf(
        IntensityPoint(0, 0f),
        IntensityPoint(1000, 1f),
        IntensityPoint(2000, 0f),
        IntensityPoint(2500, 1f),
        IntensityPoint(2500, 0f),
      )

    val sharpness =
      arrayListOf(
          SharpnessPoint(0, 1f),
          SharpnessPoint(100, 0.8f),
          SharpnessPoint(1000, 0.2f)
      )

    val plot = Plot(intensity, sharpness)

    val expectedPlotPoints =
      arrayListOf(
        PlotPoint(0, 0f, 1f),
        PlotPoint(100, 0.1f, 1f),
        PlotPoint(100, 0.1f, 0.8f),
        PlotPoint(1000, 1f, 0.8f),
        PlotPoint(1000, 1f, 0.2f),
        PlotPoint(2000, 0f, 0.2f),
        PlotPoint(2500, 1f, 0.2f),
        PlotPoint(2500, 0f, 0.2f),
      )

    assertEquals(expectedPlotPoints, generatePlotPoints(plot))
  }

  @Test
  fun onlyBarsAdjacentTest() {
    val intensity = arrayListOf(IntensityPoint(0, 0f), IntensityPoint(1000, 0f))

    val sharpness = arrayListOf(SharpnessPoint(0, 1f))

    val bars =
      arrayListOf(
        Bar(100, 200, 1f, 0.1f),
        Bar(200, 300, 1f, 0.2f), // same height
        Bar(300, 400, 0.5f, 0.3f), // lower
        Bar(400, 500, 1f, 0.4f), // upper
      )

    val plot = generateComplexPlot(Plot(intensity, sharpness), bars)

    val expectedPlotPoints =
      arrayListOf(
        PlotPoint(0, 0f, 1f),
        PlotPoint(100, 0f, 1f),
        PlotPoint(100, 1f, 0.1f), // 1
        PlotPoint(200, 1f, 0.1f),
        PlotPoint(200, 1f, 0.2f), // 2
        PlotPoint(300, 1f, 0.2f),
        PlotPoint(300, 0.5f, 0.3f), // 3
        PlotPoint(400, 0.5f, 0.3f),
        PlotPoint(400, 1f, 0.4f), // 4
        PlotPoint(500, 1f, 0.4f),
        PlotPoint(500, 0f, 1f),
        PlotPoint(1000, 0f, 1f),
      )

    assertEquals(expectedPlotPoints, generatePlotPoints(plot))
  }

  @Test
  fun onlyBarsGapTest() {
    val intensity = arrayListOf(IntensityPoint(0, 0f), IntensityPoint(1000, 0f))

    val sharpness = arrayListOf(SharpnessPoint(0, 1f))

    val bars =
      arrayListOf(
        Bar(100, 150, 1f, 0.1f),
        Bar(200, 250, 1f, 0.2f),
        Bar(300, 350, 0.5f, 0.3f),
        Bar(400, 450, 1f, 0.4f),
      )

    val plot = generateComplexPlot(Plot(intensity, sharpness), bars)

    val expectedPlotPoints =
      arrayListOf(
        PlotPoint(0, 0f, 1f),
        PlotPoint(100, 0f, 1f),
        PlotPoint(100, 1f, 0.1f), // 1
        PlotPoint(150, 1f, 0.1f),
        PlotPoint(150, 0f, 1f),
        PlotPoint(200, 0f, 1f),
        PlotPoint(200, 1f, 0.2f), // 2
        PlotPoint(250, 1f, 0.2f),
        PlotPoint(250, 0f, 1f),
        PlotPoint(300, 0f, 1f),
        PlotPoint(300, 0.5f, 0.3f), // 3
        PlotPoint(350, 0.5f, 0.3f),
        PlotPoint(350, 0f, 1f),
        PlotPoint(400, 0f, 1f),
        PlotPoint(400, 1f, 0.4f), // 4
        PlotPoint(450, 1f, 0.4f),
        PlotPoint(450, 0f, 1f),
        PlotPoint(1000, 0f, 1f),
      )

    assertEquals(expectedPlotPoints, generatePlotPoints(plot))
  }

  @Test
  fun complexTest() {
    val intensity = arrayListOf(IntensityPoint(0, 0f), IntensityPoint(1000, 0f))

    val sharpness =
      arrayListOf(
        SharpnessPoint(0, 1f),
        SharpnessPoint(200, 0.9f), // same as bar
        SharpnessPoint(320, 0.8f), // inside bar
        SharpnessPoint(360, 0.7f), // gap between bars
      )

    val bars =
      arrayListOf(
        Bar(100, 150, 1f, 0.1f),
        Bar(200, 250, 1f, 0.2f),
        Bar(300, 350, 0.5f, 0.3f),
        Bar(400, 450, 1f, 0.4f),
      )

    val plot = generateComplexPlot(Plot(intensity, sharpness), bars)

    val expectedPlotPoints =
      arrayListOf(
        PlotPoint(0, 0f, 1f),
        PlotPoint(100, 0f, 1f),
        PlotPoint(100, 1f, 0.1f), // 1
        PlotPoint(150, 1f, 0.1f),
        PlotPoint(150, 0f, 1f),
        PlotPoint(200, 0f, 1f),
        PlotPoint(200, 1f, 0.2f), // 2
        PlotPoint(250, 1f, 0.2f),
        PlotPoint(250, 0f, 0.9f),
        PlotPoint(300, 0f, 0.9f),
        PlotPoint(300, 0.5f, 0.3f), // 3
        PlotPoint(350, 0.5f, 0.3f),
        PlotPoint(350, 0f, 0.8f),
        PlotPoint(360, 0f, 0.8f),
        PlotPoint(360, 0f, 0.7f),
        PlotPoint(400, 0f, 0.7f),
        PlotPoint(400, 1f, 0.4f), // 4
        PlotPoint(450, 1f, 0.4f),
        PlotPoint(450, 0f, 0.7f),
        PlotPoint(1000, 0f, 0.7f),
      )

    assertEquals(expectedPlotPoints, generatePlotPoints(plot))
  }

  @Test
  fun verticalSharpnessTest() {
    val intensity =
      arrayListOf(
        IntensityPoint(0, 0f),
        IntensityPoint(0, 1f),
        IntensityPoint(100, 1f),
        IntensityPoint(100, 0f),
        IntensityPoint(200, 0f),
        IntensityPoint(200, 1f),
        IntensityPoint(300, 1f),
        IntensityPoint(300, 0f),
      )

    val sharpness =
      arrayListOf(
          SharpnessPoint(0, 1f),
          SharpnessPoint(100, 0.8f),
          SharpnessPoint(200, 0.9f)
      )

    val plot = Plot(intensity, sharpness)

    val expectedPlotPoints =
      arrayListOf(
        PlotPoint(0, 0f, 1f),
        PlotPoint(0, 1f, 1f),
        PlotPoint(100, 1f, 1f),
        PlotPoint(100, 0f, 0.8f),
        PlotPoint(200, 0f, 0.8f),
        PlotPoint(200, 1f, 0.9f),
        PlotPoint(300, 1f, 0.9f),
        PlotPoint(300, 0f, 0.9f),
      )

    assertEquals(expectedPlotPoints, generatePlotPoints(plot))
  }
}
