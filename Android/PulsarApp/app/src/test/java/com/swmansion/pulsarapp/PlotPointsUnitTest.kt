package com.swmansion.pulsarapp

import com.swmansion.pulsarapp.types.Bar
import com.swmansion.pulsarapp.types.IntensityPoint
import com.swmansion.pulsarapp.types.PlotPoint
import com.swmansion.pulsarapp.types.Plot
import com.swmansion.pulsarapp.types.SharpnessPoint
import org.junit.Assert.assertEquals
import org.junit.Test

class PlotPointsUnitTest {
    @Test
    fun generatePlotPointsWithoutBarsTest() {
        val points =
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

        val plot = Plot(points, sharpness)

        val expectedResult =
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

        verifyPlotPoints(expectedResult, generatePlotPoints(plot))
    }

    @Test
    fun generatePlotPointsOnlyBarsAdjacentTest() {
        val points =
            arrayListOf(
                IntensityPoint(0, 0f),
                IntensityPoint(1000, 0f),
            )

        val sharpness =
            arrayListOf(
                SharpnessPoint(0, 1f),
            )

        val bars = arrayListOf(
            Bar(100, 200, 1f, 0.1f),
            Bar(200, 300, 1f, 0.2f), // same height
            Bar(300, 400, 0.5f, 0.3f), // lower
            Bar(400, 500, 1f, 0.4f)  // upper
        )

        val plot = generateComplexPlot(Plot(points, sharpness), bars)

        val expectedResult =
            arrayListOf(
                PlotPoint(0, 0f, 1f),
                PlotPoint(100, 0f, 1f),
                PlotPoint(100, 1f, 0.1f),   // 1
                PlotPoint(200, 1f, 0.1f),
                PlotPoint(200, 1f, 0.2f),   // 2
                PlotPoint(300, 1f, 0.2f),
                PlotPoint(300, 0.5f, 0.3f), // 3
                PlotPoint(400, 0.5f, 0.3f),
                PlotPoint(400, 1f, 0.4f),   // 4
                PlotPoint(500, 1f, 0.4f),
                PlotPoint(500, 0f, 1f),
                PlotPoint(1000, 0f, 1f),)

        verifyPlotPoints(expectedResult, generatePlotPoints(plot))
    }

    @Test
    fun generatePlotPointsBarsWithGapTest() {
        val points =
            arrayListOf(
                IntensityPoint(0, 0f),
                IntensityPoint(1000, 0f),
            )

        val sharpness =
            arrayListOf(
                SharpnessPoint(0, 1f),
            )

        val bars = arrayListOf(
            Bar(100, 150, 1f, 0.1f),
            Bar(200, 250, 1f, 0.2f),
            Bar(300, 350, 0.5f, 0.3f),
            Bar(400, 450, 1f, 0.4f)
        )

        val plot = generateComplexPlot(Plot(points, sharpness), bars)

        val expectedResult =
            arrayListOf(
                PlotPoint(0, 0f, 1f),
                PlotPoint(100, 0f, 1f),
                PlotPoint(100, 1f, 0.1f),   // 1
                PlotPoint(150, 1f, 0.1f),
                PlotPoint(150, 0f, 1f),
                PlotPoint(200, 0f, 1f),
                PlotPoint(200, 1f, 0.2f),   // 2
                PlotPoint(250, 1f, 0.2f),
                PlotPoint(250, 0f, 1f),
                PlotPoint(300, 0f, 1f),
                PlotPoint(300, 0.5f, 0.3f), // 3
                PlotPoint(350, 0.5f, 0.3f),
                PlotPoint(350, 0f, 1f),
                PlotPoint(400, 0f, 1f),
                PlotPoint(400, 1f, 0.4f),   // 4
                PlotPoint(450, 1f, 0.4f),
                PlotPoint(450, 0f, 1f),
                PlotPoint(1000, 0f, 1f)
            )

        verifyPlotPoints(expectedResult, generatePlotPoints(plot))
    }

    @Test
    fun generatePlotPointsComplexTest() {
        val points =
            arrayListOf(
                IntensityPoint(0, 0f),
                IntensityPoint(1000, 0f),
            )

        val sharpness =
            arrayListOf(
                SharpnessPoint(0, 1f),
                SharpnessPoint(200, 0.9f), // same as bar
                SharpnessPoint(320, 0.8f), // inside bar
                SharpnessPoint(360, 0.7f), // gap between bars

            )

        val bars = arrayListOf(
            Bar(100, 150, 1f, 0.1f),
            Bar(200, 250, 1f, 0.2f),
            Bar(300, 350, 0.5f, 0.3f),
            Bar(400, 450, 1f, 0.4f)
        )

        val plot = generateComplexPlot(Plot(points, sharpness), bars)

        plot.sharpness.forEach {
            println("shrap: ${it.relativeTime} ${it.sharpness}")
        }

        val expectedResult =
            arrayListOf(
                PlotPoint(0, 0f, 1f),
                PlotPoint(100, 0f, 1f),
                PlotPoint(100, 1f, 0.1f),   // 1
                PlotPoint(150, 1f, 0.1f),
                PlotPoint(150, 0f, 1f),
                PlotPoint(200, 0f, 1f),
                PlotPoint(200, 1f, 0.2f),   // 2
                PlotPoint(250, 1f, 0.2f),
                PlotPoint(250, 0f, 0.9f),
                PlotPoint(300, 0f, 0.9f),
                PlotPoint(300, 0.5f, 0.3f), // 3
                PlotPoint(350, 0.5f, 0.3f),
                PlotPoint(350, 0f, 0.8f),
                PlotPoint(360, 0f, 0.8f),
                PlotPoint(360, 0f, 0.7f),
                PlotPoint(400, 0f, 0.7f),
                PlotPoint(400, 1f, 0.4f),   // 4
                PlotPoint(450, 1f, 0.4f),
                PlotPoint(450, 0f, 0.7f),
                PlotPoint(1000, 0f, 0.7f)
            )

        verifyPlotPoints(expectedResult, generatePlotPoints(plot))
    }

    @Test
    fun generatePlotPointsVerticalFrequencyTest() {
        val points =
            arrayListOf(
                IntensityPoint(0, 0f),
                IntensityPoint(0, 1f),
                IntensityPoint(100, 1f),
                IntensityPoint(100, 0f),
                IntensityPoint(200, 0f),
                IntensityPoint(200, 1f),
                IntensityPoint(300, 1f),
                IntensityPoint(300, 0f)
            )

        val sharpness =
            arrayListOf(
                SharpnessPoint(0, 1f),
                SharpnessPoint(100, 0.8f),
                SharpnessPoint(200, 0.9f)
            )

        val plot = Plot(points, sharpness)

        val expectedResult =
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

        verifyPlotPoints(expectedResult, generatePlotPoints(plot))
    }

    private fun verifyPlotPoints(expected: ArrayList<PlotPoint>, actual: ArrayList<PlotPoint>) {
        for (i in 0..actual.size - 1) {
            assertEquals(
                true,
                expected[i].relativeTime == actual[i].relativeTime &&
                        expected[i].sharpness == actual[i].sharpness &&
                        expected[i].intensity == actual[i].intensity,
            )
        }
    }
}
