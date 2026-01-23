package com.swmansion.pulsar

import com.swmansion.pulsar.types.Bar
import com.swmansion.pulsar.types.IntensityPoint
import com.swmansion.pulsar.types.Plot
import org.junit.Assert.*
import org.junit.Test

class GenerateComplexPlotIntensityTest {
  @Test
  fun horizontalTest() {
    val bars =
      arrayListOf(
        Bar(0, 100, 1f, 1f), // beginning
        Bar(200, 300, 1f, 1f), // middle
        Bar(400, 500, 1f, 1f), // end
      )

    val plot =
        generateComplexPlot(
            Plot(
                arrayListOf(
                    IntensityPoint(0, 0f),
                    IntensityPoint(0, 0.2f),
                    IntensityPoint(500, 0.2f),
                    IntensityPoint(500, 0f),
                ),
                CONST_PLOT_SHARPNESS,
            ),
            bars,
        )

    val expectedIntensity =
      arrayListOf(
        IntensityPoint(0, 0f),
        IntensityPoint(0, 1f),
        IntensityPoint(100, 1f),
        IntensityPoint(100, 0.2f),
        IntensityPoint(200, 0.2f),
        IntensityPoint(200, 1f),
        IntensityPoint(300, 1f),
        IntensityPoint(300, 0.2f),
        IntensityPoint(400, 0.2f),
        IntensityPoint(400, 1f),
        IntensityPoint(500, 1f),
        IntensityPoint(500, 0f),
      )

    assertEquals(expectedIntensity, plot.intensity)
  }

  @Test
  fun adjacentBarsTest() {
    val bars =
      arrayListOf(
        Bar(50, 100, 1f, 1f),
        Bar(100, 150, 0.8f, 1f),
        Bar(200, 250, 0.8f, 1f),
        Bar(250, 300, 1f, 1f),
        Bar(300, 350, 0.8f, 1f),
      )

    val plot =
        generateComplexPlot(
            Plot(
                arrayListOf(
                    IntensityPoint(0, 0f),
                    IntensityPoint(0, 0.2f),
                    IntensityPoint(500, 0.2f),
                    IntensityPoint(500, 0f),
                ),
                CONST_PLOT_SHARPNESS,
            ),
            bars,
        )

    val expectedIntensity =
      arrayListOf(
        IntensityPoint(0, 0f),
        IntensityPoint(0, 0.2f),
        IntensityPoint(50, 0.2f),
        IntensityPoint(50, 1f),
        IntensityPoint(100, 1f),
        IntensityPoint(100, 0.8f),
        IntensityPoint(150, 0.8f),
        IntensityPoint(150, 0.2f),
        IntensityPoint(200, 0.2f),
        IntensityPoint(200, 0.8f),
        IntensityPoint(250, 0.8f),
        IntensityPoint(250, 1f),
        IntensityPoint(300, 1f),
        IntensityPoint(300, 0.8f),
        IntensityPoint(350, 0.8f),
        IntensityPoint(350, 0.2f),
        IntensityPoint(500, 0.2f),
        IntensityPoint(500, 0f),
      )

    assertEquals(expectedIntensity, plot.intensity)
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

    val plot =
        generateComplexPlot(
            Plot(
                arrayListOf(
                    IntensityPoint(0, 0f),
                    IntensityPoint(0, 0.2f),
                    IntensityPoint(500, 0.2f),
                    IntensityPoint(500, 0f),
                ),
                CONST_PLOT_SHARPNESS,
            ),
            bars,
        )

    val expectedIntensity =
      arrayListOf(
        IntensityPoint(0, 0f),
        IntensityPoint(0, 0.2f),
        IntensityPoint(50, 0.2f),
        IntensityPoint(50, 1f),
        IntensityPoint(150, 1f),
        IntensityPoint(150, 0.2f),
        IntensityPoint(200, 0.2f),
        IntensityPoint(200, 1f),
        IntensityPoint(400, 1f),
        IntensityPoint(400, 0.2f),
        IntensityPoint(500, 0.2f),
        IntensityPoint(500, 0f),
      )

    assertEquals(expectedIntensity, plot.intensity)
  }

  @Test
  fun barOverlappingMultipleLinesTest() {
    val bars =
      arrayListOf(
        Bar(50, 100, 1f, 1f),
        Bar(100, 150, 1f, 1f),
        Bar(200, 250, 1f, 1f),
        Bar(250, 300, 1f, 1f),
        Bar(300, 350, 1f, 1f),
        Bar(350, 400, 1f, 1f),
      )

    val plot =
        generateComplexPlot(
            Plot(
                arrayListOf(
                    IntensityPoint(0, 0f),
                    IntensityPoint(0, 0.2f),
                    IntensityPoint(500, 0.2f),
                    IntensityPoint(500, 0f),
                ),
                CONST_PLOT_SHARPNESS,
            ),
            bars,
        )

    val expectedIntensity =
      arrayListOf(
        IntensityPoint(0, 0f),
        IntensityPoint(0, 0.2f),
        IntensityPoint(50, 0.2f),
        IntensityPoint(50, 1f),
        IntensityPoint(150, 1f),
        IntensityPoint(150, 0.2f),
        IntensityPoint(200, 0.2f),
        IntensityPoint(200, 1f),
        IntensityPoint(400, 1f),
        IntensityPoint(400, 0.2f),
        IntensityPoint(500, 0.2f),
        IntensityPoint(500, 0f),
      )

    assertEquals(expectedIntensity, plot.intensity)
  }

  @Test
  fun complexTest() {
    val intensity =
      arrayListOf(
        IntensityPoint(0, 0f),
        IntensityPoint(100, 0.2f),
        IntensityPoint(200, 0.2f),
        IntensityPoint(300, 1f),
        IntensityPoint(500, 0f),
        IntensityPoint(700, 0.2f),
        IntensityPoint(800, 0.5f),
        IntensityPoint(800, 0.7f),
        IntensityPoint(900, 0.7f),
        IntensityPoint(1000, 0.5f),
        IntensityPoint(1200, 0f),
        IntensityPoint(1200, 0.5f),
        IntensityPoint(1200, 0f),
        IntensityPoint(1300, 0.9f),
        IntensityPoint(1600, 0.9f),
        IntensityPoint(1600, 0f),
      )

    val bars =
      arrayListOf(
        Bar(50, 100, 1f, 1f), // end point
        Bar(550, 650, 1f, 1f), // inside
        Bar(750, 800, 1f, 1f), // vertical end
        Bar(800, 950, 0.9f, 1f), // vertical start
        Bar(1100, 1400, 1f, 1f), // overlapping
      )

    val plot = generateComplexPlot(Plot(intensity, CONST_PLOT_SHARPNESS), bars)

    val expectedIntensity =
      arrayListOf(
        IntensityPoint(0, 0f),
        IntensityPoint(50, 0.1f),
        IntensityPoint(50, 1f),
        IntensityPoint(100, 1f),
        IntensityPoint(100, 0.2f),
        IntensityPoint(200, 0.2f),
        IntensityPoint(300, 1f),
        IntensityPoint(500, 0f),
        IntensityPoint(550, 0.05f),
        IntensityPoint(550, 1f),
        IntensityPoint(650, 1f),
        IntensityPoint(650, 0.15f),
        IntensityPoint(700, 0.2f),
        IntensityPoint(750, 0.35f),
        IntensityPoint(750, 1f),
        IntensityPoint(800, 1f),
        IntensityPoint(800, 0.9f),
        IntensityPoint(950, 0.9f),
        IntensityPoint(950, 0.6f),
        IntensityPoint(1000, 0.5f),
        IntensityPoint(1100, 0.25f),
        IntensityPoint(1100, 1f),
        IntensityPoint(1400, 1f),
        IntensityPoint(1400, 0.9f),
        IntensityPoint(1600, 0.9f),
        IntensityPoint(1600, 0f),
      )

    assertEquals(expectedIntensity, plot.intensity)
  }
}
