package com.swmansion.pulsarapp

import com.swmansion.pulsarapp.types.Bar
import com.swmansion.pulsarapp.types.IntensityPoint
import com.swmansion.pulsarapp.types.Plot
import com.swmansion.pulsarapp.types.SharpnessPoint
import org.junit.Assert.assertEquals
import org.junit.Test

class SharpnessUnitTest {

  @Test
  fun getSharpnessFromIntervalTest() {
    val sharpness1 = SharpnessPoint(0, 1f)
    val sharpness2 = SharpnessPoint(100, 0.5f)
    val sharpness3 = SharpnessPoint(200, 1f)
    val sharpness4 = SharpnessPoint(300, 0.5f)
    val sharpness5 = SharpnessPoint(400, 1f)
    val sharpness6 = SharpnessPoint(500, 0.5f)

    val sharpness =
      arrayListOf(sharpness1, sharpness2, sharpness3, sharpness4, sharpness5, sharpness6)

    // start with frequency change
    verifySharpnessPoints(
      arrayListOf(sharpness1),
      getSharpnessFromInterval(sharpness1.relativeTime, 50, sharpness),
    )
    verifySharpnessPoints(
      arrayListOf(sharpness2),
      getSharpnessFromInterval(sharpness2.relativeTime, 150, sharpness),
    )

    // end with frequency change
    verifySharpnessPoints(
      arrayListOf(sharpness1),
      getSharpnessFromInterval(sharpness1.relativeTime, sharpness2.relativeTime, sharpness),
    )
    verifySharpnessPoints(
      arrayListOf(sharpness1, sharpness2),
      getSharpnessFromInterval(sharpness1.relativeTime, sharpness3.relativeTime, sharpness),
    )

    // multiple frequency changes within interval
    verifySharpnessPoints(
      arrayListOf(sharpness1, sharpness2, sharpness3, sharpness4, sharpness5, sharpness6),
      getSharpnessFromInterval(sharpness1.relativeTime, 600, sharpness),
    )
    verifySharpnessPoints(
      arrayListOf(sharpness5, sharpness6),
      getSharpnessFromInterval(sharpness5.relativeTime, 600, sharpness),
    )
    verifySharpnessPoints(
      arrayListOf(
        SharpnessPoint(50, sharpness1.sharpness),
        sharpness2,
        sharpness3,
        sharpness4,
        sharpness5,
        sharpness6,
      ),
      getSharpnessFromInterval(50, 550, sharpness),
    )
  }

  @Test
  fun complexSharpnessTest() {
    val sharpness =
      arrayListOf(SharpnessPoint(0, 0.5f), SharpnessPoint(100, 0.51f), SharpnessPoint(200, 0.52f))

    val intensity = arrayListOf(IntensityPoint(0, 0f), IntensityPoint(1000, 0f))
    val initPlot = Plot(intensity, sharpness)

    // bars between sharpness points
    val barBetweenSharpness = Bar(50, 80, 1f, 0.9f)
    verifySharpnessPoints(
      arrayListOf(
        sharpness[0],
        SharpnessPoint(barBetweenSharpness.x1, barBetweenSharpness.sharpness),
        SharpnessPoint(barBetweenSharpness.x2, sharpness[0].sharpness),
        sharpness[1],
        sharpness[2],
      ),
      generateComplexPlot(initPlot, arrayListOf(barBetweenSharpness)).sharpness,
    )

    // bar on intensity line start
    val barLineStart = Bar(0, 80, 1f, 0.91f)
    verifySharpnessPoints(
      arrayListOf(
        SharpnessPoint(0, barLineStart.sharpness),
        SharpnessPoint(barLineStart.x2, sharpness[0].sharpness),
        sharpness[1],
        sharpness[2],
      ),
      generateComplexPlot(initPlot, arrayListOf(barLineStart)).sharpness,
    )

    // bar starts with sharpness point
    val barStartsWithSharpness = Bar(sharpness[1].relativeTime, 180, 1f, 0.92f)
    verifySharpnessPoints(
      arrayListOf(
        sharpness[0],
        SharpnessPoint(barStartsWithSharpness.x1, barStartsWithSharpness.sharpness),
        SharpnessPoint(barStartsWithSharpness.x2, sharpness[1].sharpness),
        sharpness[2],
      ),
      generateComplexPlot(initPlot, arrayListOf(barStartsWithSharpness)).sharpness,
    )

    // bar ends with sharpness point
    val barEndWithSharpness = Bar(150, sharpness[2].relativeTime, 1f, 0.94f)
    verifySharpnessPoints(
      arrayListOf(
        sharpness[0],
        sharpness[1],
        SharpnessPoint(barEndWithSharpness.x1, barEndWithSharpness.sharpness),
        SharpnessPoint(barEndWithSharpness.x2, sharpness[2].sharpness),
      ),
      generateComplexPlot(initPlot, arrayListOf(barEndWithSharpness)).sharpness,
    )

    // bar ends with line start
    val barLineEnd = Bar(250, 1000, 1f, 0.95f)
    verifySharpnessPoints(
      arrayListOf(
        sharpness[0],
        sharpness[1],
        sharpness[2],
        SharpnessPoint(barLineEnd.x1, barLineEnd.sharpness),
        SharpnessPoint(barLineEnd.x2, sharpness[2].sharpness),
      ),
      generateComplexPlot(initPlot, arrayListOf(barLineEnd)).sharpness,
    )

    // bar overlaps multiple sharpness points
    val barOverlap = Bar(50, 250, 1f, 0.96f)
    verifySharpnessPoints(
      arrayListOf(
        sharpness[0],
        SharpnessPoint(barOverlap.x1, barOverlap.sharpness),
        SharpnessPoint(barOverlap.x2, sharpness[2].sharpness),
      ),
      generateComplexPlot(initPlot, arrayListOf(barOverlap)).sharpness,
    )
  }

  private fun verifySharpnessPoints(
    expected: ArrayList<SharpnessPoint>,
    actual: ArrayList<SharpnessPoint>?,
  ) {
    assertEquals(actual == null, false)

    actual?.let {
      for (i in 0..actual.size - 1) {
        assertEquals(
          true,
          expected[i].relativeTime == actual[i].relativeTime &&
            expected[i].sharpness == actual[i].sharpness,
        )
      }
    }
  }
}
