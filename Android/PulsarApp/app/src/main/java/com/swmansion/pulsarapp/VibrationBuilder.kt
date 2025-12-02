package com.swmansion.pulsarapp

import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.util.Log
import androidx.annotation.RequiresApi
import com.swmansion.pulsarapp.types.Bar
import com.swmansion.pulsarapp.types.ControlPoint
import com.swmansion.pulsarapp.types.Point
import com.swmansion.pulsarapp.types.Preset
import kotlin.collections.forEach
import kotlin.collections.plusAssign
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

const val MAX_AMPLITUDE = 255
const val STEPS_PER_100_MS = 30
const val DEFAULT_SHARPNESS = 1f

class VibrationBuilder(val vibrationService: Vibrator) {
  fun createVibrationEffect(preset: Preset): VibrationEffect? {
    val (_, bars, points) = preset

    if (bars == null && points == null) {
      Log.w(TAG, "Vibration creation failed. No data in preset.")
      return null
    } else if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      Log.w(TAG, "Vibration not supported on version before 26 yet.") // TODO: handle somehow
      return null
    } else {
      if (bars != null && points != null) {
        val complexWaveform = createComplexWaveform(points, bars)

        Log.i(TAG, "Complex vibration created based on bars and points.")
        return complexWaveform
      } else {
        val barsWaveform = bars?.let { createWaveformFromBars(it) }
        val pointsWaveform = points?.let { createWaveformFromPoints(it) }

        if (barsWaveform != null) {
          Log.i(TAG, "Vibration created based on bars.")
          return barsWaveform
        } else if (pointsWaveform != null) {
          Log.i(TAG, "Vibration created based on points.")
          return pointsWaveform
        } else {
          Log.w(TAG, "Vibration creation failed.")
          return null
        }
      }
    }
  }

  @RequiresApi(Build.VERSION_CODES.O)
  private fun createWaveformFromBars(bars: ArrayList<Bar>): VibrationEffect {
    return if (isEnvelopeSupported()) {
      val points = convertBarsToPoints(bars)
      createEnvelopeWaveform(points)
    } else createWaveform(bars)
  }

  @RequiresApi(Build.VERSION_CODES.O)
  private fun createWaveformFromPoints(points: ArrayList<Point>): VibrationEffect? {
    return if (isEnvelopeSupported()) createEnvelopeWaveform(points)
    else {
      val bars = convertPointsToBars(points)
      createWaveform(bars)
    }
  }

  @RequiresApi(Build.VERSION_CODES.O)
  private fun createComplexWaveform(
    points: ArrayList<Point>,
    bars: ArrayList<Bar>,
  ): VibrationEffect? {
    val mergedPoints = mergePointsAndBars(bars, points)
    return createWaveformFromPoints(mergedPoints)
  }

  @RequiresApi(Build.VERSION_CODES.O)
  private fun createWaveform(bars: ArrayList<Bar>): VibrationEffect {
    var timings = longArrayOf()
    var amplitudes = intArrayOf()

    val n = bars.size
    for (i in 0..n - 1) {
      val currBar = bars[i]

      // add pause at the beginning
      if (i == 0 && currBar.x1 != 0L) {
        timings += currBar.x1
        amplitudes += 0
      }

      // add bar
      val currBarDuration = currBar.x2 - currBar.x1
      timings += currBarDuration
      amplitudes += (currBar.intensity * MAX_AMPLITUDE).roundToInt()

      // add pause between bars
      val nextBar = if (i != n - 1) bars[i + 1] else null
      if (nextBar != null && currBar.x2 != nextBar.x1) {
        val pauseDuration = nextBar.x1 - currBar.x2
        timings += pauseDuration
        amplitudes += 0
      }
    }

    return VibrationEffect.createWaveform(timings, amplitudes, -1)
  }

  @RequiresApi(Build.VERSION_CODES.BAKLAVA)
  private fun createEnvelopeWaveform(points: ArrayList<Point>): VibrationEffect {
    val controlPoints = getControlPoints(points)

    Log.i(TAG, "----------- POINTS -----------")
    printPointsToPlot(points)
    Log.i(TAG, "----------- CONTROL POINTS -----------")
    val plotControlPoints = convertControlPointToPoints(controlPoints)
    printPointsToPlot(plotControlPoints)
    Log.i(TAG, "--------------------------------------")

    return vibrationService.frequencyProfile?.let {
      val builder = VibrationEffect.WaveformEnvelopeBuilder()
      controlPoints.forEach { builder.addControlPoint(it.intensity, it.sharpness, it.duration) }
      builder.build()
    }
      ?: run {
        val builder = VibrationEffect.BasicEnvelopeBuilder()
        controlPoints.forEach { builder.addControlPoint(it.intensity, it.sharpness, it.duration) }
        builder.build()
      }
  }

  @RequiresApi(Build.VERSION_CODES.BAKLAVA)
  private fun getControlPoints(points: ArrayList<Point>): ArrayList<ControlPoint> {
    val controlPoints = ArrayList<ControlPoint>()
    val n = points.size
    val minDuration = vibrationService.envelopeEffectInfo.minControlPointDurationMillis

    for (i in 1..n - 1) {
      val currPoint = points[i]
      val prevPoint = points[i - 1]

      val pointsTimeDiff = currPoint.relativeTime - prevPoint.relativeTime
      val duration = if (pointsTimeDiff > 0) pointsTimeDiff else minDuration

      controlPoints += createControlPoint(currPoint.intensity, currPoint.sharpness, duration)
    }

    return controlPoints
  }

  @RequiresApi(Build.VERSION_CODES.BAKLAVA)
  private fun createControlPoint(intensity: Float, sharpness: Float, duration: Long): ControlPoint {
    val envelopeInfo = vibrationService.envelopeEffectInfo
    val frequencyProfile = vibrationService.frequencyProfile

    val minDuration = envelopeInfo.minControlPointDurationMillis
    val maxDuration = envelopeInfo.maxControlPointDurationMillis
    val adjustedDuration = max(min(duration, maxDuration), minDuration)

    val adjustedSharpness =
      frequencyProfile?.let {
        sharpness * (it.maxFrequencyHz - it.minFrequencyHz) + it.minFrequencyHz
      } ?: sharpness

    return ControlPoint(intensity, adjustedSharpness, adjustedDuration)
  }

  private fun isEnvelopeSupported(): Boolean {
    return Build.VERSION.SDK_INT >= Build.VERSION_CODES.BAKLAVA &&
            vibrationService.areEnvelopeEffectsSupported()
  }
}
