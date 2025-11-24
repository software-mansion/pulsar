package com.swmansion.pulsarapp

import com.swmansion.pulsarapp.types.Bar
import com.swmansion.pulsarapp.types.EnvelopePoint
import org.junit.Assert.*
import org.junit.Test

/**
 * Example local unit test, which will execute on the development machine (host).
 *
 * See [testing documentation](http://d.android.com/tools/testing).
 */
class ExampleUnitTest {
  @Test
  fun basicConvertBarsToPointsTest() {
    val bars =
      arrayListOf(
        Bar(100, 200, 0.3f, 0.8f),
        Bar(300, 500, 0.6f, 0.8f),
        Bar(600, 800, 1f, 0.8f)
      )

    val vibrationBuilder = VibrationBuilder()
    val points = vibrationBuilder.convertBarsToPoints(bars)

    val expectedPoints: ArrayList<EnvelopePoint> =
      arrayListOf(
        EnvelopePoint(0f, 0f, 0),
        EnvelopePoint(0f, 0.8f, 100),
        EnvelopePoint(0.3f, 0.8f, 100),
        EnvelopePoint(0.3f, 0.8f, 200),
        EnvelopePoint(0f, 0.8f, 200),
        EnvelopePoint(0f, 0.8f, 300),
        EnvelopePoint(0.6f, 0.8f, 300),
        EnvelopePoint(0.6f, 0.8f, 500),
        EnvelopePoint(0f, 0.8f, 500),
        EnvelopePoint(0f, 0.8f, 600),
        EnvelopePoint(1f, 0.8f, 600),
        EnvelopePoint(1f, 0.8f, 800),
        EnvelopePoint(0f, 0.8f, 800),
      )

    assertEquals(points, expectedPoints)
  }

  @Test
  fun commonPointConvertBarsToPointsTest() {
    val bars = arrayListOf(
      Bar(100, 200, 0.3f, 0.8f),
      Bar(200, 300, 0.6f, 0.8f)
    )

    val vibrationBuilder = VibrationBuilder()
    val points = vibrationBuilder.convertBarsToPoints(bars)

    val expectedPoints: ArrayList<EnvelopePoint> =
      arrayListOf(
        EnvelopePoint(0f, 0f, 0),
        EnvelopePoint(0f, 0.8f, 100),
        EnvelopePoint(0.3f, 0.8f, 100),
        EnvelopePoint(0.3f, 0.8f, 200),
        EnvelopePoint(0.6f, 0.8f, 200),
        EnvelopePoint(0.6f, 0.8f, 300),
        EnvelopePoint(0f, 0.8f, 300),
      )

    assertEquals(points, expectedPoints)
  }

  @Test
  fun startWith0ConvertBarsToPointsTest() {
    val bars = arrayListOf(
      Bar(0, 200, 0.3f, 0.8f)
    )

    val vibrationBuilder = VibrationBuilder()
    val points = vibrationBuilder.convertBarsToPoints(bars)

    val expectedPoints: ArrayList<EnvelopePoint> =
      arrayListOf(
        EnvelopePoint(0f, 0.8f, 0),
        EnvelopePoint(0.3f, 0.8f, 0),
        EnvelopePoint(0.3f, 0.8f, 200),
        EnvelopePoint(0f, 0.8f, 200),
      )

    assertEquals(points, expectedPoints)
  }

  @Test
  fun mapBarsToPoints(){
    val bars = arrayListOf(
      Bar(500, 600, 1f, 1f),
    )
    val points =
      arrayListOf(
        EnvelopePoint(0f, 1f, 0),
        EnvelopePoint(0.6f, 1f, 500),
        EnvelopePoint(0f, 1f, 1000),
      )

    val builder = VibrationBuilder()

    val p = builder.mergePointsAndBars(bars, points)

    for (i in p){
      println(i.toString())
    }

  }
}
