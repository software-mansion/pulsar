package com.swmansion.pulsarapp

import com.swmansion.pulsarapp.types.Bar
import com.swmansion.pulsarapp.types.Preset
import org.junit.Assert.*
import org.junit.Test

/**
 * Example local unit test, which will execute on the development machine (host).
 *
 * See [testing documentation](http://d.android.com/tools/testing).
 */
class ExampleUnitTest {
  @Test
  fun convertBarsToPoints() {
    val bars = arrayListOf(
        Bar(100, 200, 0.3f, 0.8f),
        Bar(300, 500, 0.6f, 0.8f),
        Bar(600, 800, 1f, 0.8f)
    )
    val preset = Preset(name = "test", barsList = bars)

    val expectedPositions = listOf<Long>(0, 100, 100, 200, 200, 300, 300, 500, 500, 600, 600, 800)
    val expectedAmplitude = listOf(0f, 0f, 0.3f, 0.3f, 0f, 0f, 0.6f, 0.6f, 0f, 0f, 1f, 1f)

    val points = preset.convertBarsToPoints(bars)

    val convertedTimes = points?.map { it.relativeTime }
    val convertedAmplitude = points?.map { it.intensity }

    assertEquals(expectedPositions.size, convertedTimes?.size)
    assertEquals(expectedAmplitude.size, convertedAmplitude?.size)
    assertEquals(convertedTimes?.size, convertedAmplitude?.size)

    for (i in 0..expectedPositions.size - 1) {
      assertEquals(expectedPositions[i], convertedTimes?.get(i))
      assertEquals(expectedAmplitude[i], convertedAmplitude?.get(i))
    }
  }
}
