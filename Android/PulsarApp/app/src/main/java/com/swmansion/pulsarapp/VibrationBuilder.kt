package com.swmansion.pulsarapp

import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.vibrator.VibratorFrequencyProfile
import android.util.Log
import androidx.annotation.RequiresApi
import com.swmansion.pulsarapp.types.Bar
import com.swmansion.pulsarapp.types.ControlPoint
import com.swmansion.pulsarapp.types.Plot
import com.swmansion.pulsarapp.types.PlotPoint
import com.swmansion.pulsarapp.types.Preset
import com.swmansion.pulsarapp.types.SubtractableItem
import kotlin.collections.forEach
import kotlin.collections.plusAssign
import kotlin.math.floor
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

const val MAX_INT_AMPLITUDE = 255

class VibrationBuilder(val vibrationService: Vibrator) {
  fun createVibrationEffect(preset: Preset): VibrationEffect? {
    val (_, impulses, plot) = preset
    val bars = impulses?.let { convertImpulsesToBars(vibrationService, it) }

    if (bars == null && plot == null) {
      Log.w(TAG, "Vibration creation failed. No data in preset.")
      return null
    } else if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      Log.w(TAG, "Vibration not supported on version before 26 yet.") // TODO: handle somehow
      return null
    } else {
      if (bars != null && plot != null) {
        val complexWaveform = createComplexWaveform(plot, bars)

        complexWaveform?.let { Log.i(TAG, "Complex vibration created.") }
          ?: run { Log.w(TAG, "Complex vibration creation failed.") }

        return complexWaveform
      } else {
        val barsWaveform = bars?.let { createWaveformFromBars(it) }
        val plotWaveform = plot?.let { createWaveformFromPlot(it) }

        if (barsWaveform != null) {
          Log.i(TAG, "Vibration created based on bars.")
          return barsWaveform
        } else if (plotWaveform != null) {
          Log.i(TAG, "Vibration created based on points.")
          return plotWaveform
        } else {
          Log.w(TAG, "Vibration creation failed.")
          return null
        }
      }
    }
  }

  @RequiresApi(Build.VERSION_CODES.O)
  private fun createWaveformFromBars(bars: ArrayList<Bar>): VibrationEffect {
    return if (areEnvelopesSupported()) {
      val plot = generatePlot(bars)
      createEnvelopeWaveform(plot)
    } else {
      createWaveform(bars)
    }
  }

  @RequiresApi(Build.VERSION_CODES.O)
  private fun createWaveformFromPlot(plot: Plot): VibrationEffect? {
    return if (areEnvelopesSupported()) createEnvelopeWaveform(plot)
    else {
      val bars = generateBars(plot)
      createWaveform(bars)
    }
  }

  @RequiresApi(Build.VERSION_CODES.O)
  private fun createComplexWaveform(plot: Plot, bars: ArrayList<Bar>): VibrationEffect? {
    val complexPlot = generateComplexPlot(plot, bars)
    return createWaveformFromPlot(complexPlot)
  }

  @RequiresApi(Build.VERSION_CODES.O)
  private fun createWaveform(bars: ArrayList<Bar>): VibrationEffect {
    printBarsToPlot(bars)

    val barsWithPauses = getBarsWithPauses(bars)

    var timings = longArrayOf()
    var amplitudes = intArrayOf()

    barsWithPauses.forEach {
      val duration = it.x2 - it.x1
      timings += duration
      amplitudes += (it.intensity * MAX_INT_AMPLITUDE).roundToInt()
    }

    return if(vibrationService.hasAmplitudeControl())
      VibrationEffect.createWaveform(timings, amplitudes, -1)
     else VibrationEffect.createWaveform(timings, -1)
  }

  @RequiresApi(Build.VERSION_CODES.BAKLAVA)
  private fun createEnvelopeWaveform(plot: Plot): VibrationEffect {
    val points = generatePlotPoints(plot)

    val expectedVibrationTime = plot.intensity.last().relativeTime
    val controlPoints =
      getShortenControlPoints(expectedVibrationTime, convertPointsToControlPoints(points))

    val initialSharpness = plot.sharpness[0].sharpness

    printPointsToPlot(points)
    printControlPointsToPlot(controlPoints)

    return vibrationService.frequencyProfile?.let { frequencyProfile ->
      val builder = VibrationEffect.WaveformEnvelopeBuilder()
      controlPoints.forEach {
        builder
          .setInitialFrequencyHz(getSharpnessInHz(initialSharpness, frequencyProfile))
          .addControlPoint(it.intensity, getSharpnessInHz(it.sharpness, frequencyProfile), it.duration)
      }
      builder.build()
    }
      ?: run {
        val builder = VibrationEffect.BasicEnvelopeBuilder()
        controlPoints.forEach {
          builder
            .setInitialSharpness(initialSharpness)
            .addControlPoint(it.intensity, it.sharpness, it.duration)
        }
        builder.build()
      }
  }

  // shorten some intervals to archive deterministic vibration length
  @RequiresApi(Build.VERSION_CODES.BAKLAVA)
  private fun getShortenControlPoints(
    expectedVibrationTime: Long,
    controlPoints: ArrayList<ControlPoint>,
  ): ArrayList<ControlPoint> {
    val subtractableItems = getSubtractableItems(expectedVibrationTime, controlPoints)
    val result = ArrayList<ControlPoint>()

    controlPoints.forEachIndexed { index, point ->
      result +=
        ControlPoint(
          point.intensity,
          point.sharpness,
          point.duration - subtractableItems[index].value,
        )
    }

    return result
  }

  @RequiresApi(Build.VERSION_CODES.BAKLAVA)
  private fun getSubtractableItems(
    expectedVibrationTime: Long,
    controlPoints: ArrayList<ControlPoint>,
  ): ArrayList<SubtractableItem> {
    val minControlPointDuration = vibrationService.envelopeEffectInfo.minControlPointDurationMillis

    val time = controlPoints.sumOf { it.duration }
    var timeDiff = time - expectedVibrationTime
    val subtractableTime = controlPoints.sumOf { it.duration - minControlPointDuration }

    if (subtractableTime < timeDiff) {
      Log.w(
        TAG,
        "There is not enough subtractable time to make exact adjustment. $subtractableTime/$timeDiff will be adjusted.",
      )
      timeDiff = subtractableTime
    }

    val subtractableItems = ArrayList<SubtractableItem>()

    controlPoints.forEachIndexed { index, point ->
      val maxValue = point.duration - minControlPointDuration
      subtractableItems +=
        SubtractableItem(
          index,
          maxValue,
          if (maxValue > 0) {
            val ratio = maxValue.toFloat() / subtractableTime
            floor(ratio * timeDiff).toLong()
          } else 0,
        )
    }

    val valuesSum = subtractableItems.sumOf { it.value }
    var leftTime = timeDiff - valuesSum

    val nSubtractableItems = subtractableItems.size
    for (i in 0..nSubtractableItems - 1) {
      if (leftTime == 0L) {
        break
      }

      val item = subtractableItems[i]
      if (item.maxValue > item.value) {
        item.value += 1
        leftTime -= 1
      }
    }

    return subtractableItems
  }

  @RequiresApi(Build.VERSION_CODES.BAKLAVA)
  private fun convertPointsToControlPoints(points: ArrayList<PlotPoint>): ArrayList<ControlPoint> {
    val controlPoints = ArrayList<ControlPoint>()
    val nPoints = points.size

    for (i in 1..nPoints - 1) {
      val prevPoint = points[i - 1]
      val currPoint = points[i]

      val duration = currPoint.relativeTime - prevPoint.relativeTime
      controlPoints += createControlPoint(currPoint.intensity, currPoint.sharpness, duration)
    }

    return controlPoints
  }

  @RequiresApi(Build.VERSION_CODES.BAKLAVA)
  private fun createControlPoint(intensity: Float, sharpness: Float, duration: Long): ControlPoint {
    val envelopeInfo = vibrationService.envelopeEffectInfo

    val minDuration = envelopeInfo.minControlPointDurationMillis
    val maxDuration = envelopeInfo.maxControlPointDurationMillis
    val adjustedDuration = max(min(duration, maxDuration), minDuration)

    return ControlPoint(intensity, sharpness, adjustedDuration)
  }

  @RequiresApi(Build.VERSION_CODES.BAKLAVA)
  private fun getSharpnessInHz(
    sharpness: Float,
    frequencyProfile: VibratorFrequencyProfile,
  ): Float {
    return frequencyProfile.let {
      sharpness * (it.maxFrequencyHz - it.minFrequencyHz) + it.minFrequencyHz
    }
  }

  private fun areEnvelopesSupported(): Boolean {
    return Build.VERSION.SDK_INT >= Build.VERSION_CODES.BAKLAVA &&
      vibrationService.areEnvelopeEffectsSupported()
  }
}
