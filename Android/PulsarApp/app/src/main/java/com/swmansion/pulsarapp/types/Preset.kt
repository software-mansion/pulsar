package com.swmansion.pulsarapp.types

import android.os.Build
import android.os.VibrationEffect
import android.os.vibrator.VibratorEnvelopeEffectInfo
import android.os.vibrator.VibratorFrequencyProfile
import android.util.Log
import androidx.annotation.RequiresApi
import com.swmansion.pulsarapp.TAG
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

const val MAX_AMPLITUDE = 255

data class CreateVibrationEffectProps(
  val frequencyProfile: VibratorFrequencyProfile? = null,
  val envelopeInfo: VibratorEnvelopeEffectInfo,
)

data class Preset(
  val name: String,
  val barsList: ArrayList<Bar>? = null,
  val controlPointsList: ArrayList<EnvelopePoint>? = null,
) {
  init {
    barsList?.let {
      for (bar in barsList) {
        checkAmplitude(bar.amplitude)
        checkFrequency(bar.frequency)
      }
      controlPointsList?.let {
        for (point in controlPointsList) {
          checkAmplitude(point.intensity)
          checkFrequency(point.sharpness)
        }
      }
    }
  }

  private fun checkAmplitude(amplitude: Float) {
    if (amplitude < 0 || amplitude > 1) {
      throw Exception("Found invalid amplitude: ${amplitude}. Amplitude must be value from [0,1].")
    }
  }

  private fun checkFrequency(frequency: Float) {
    if (frequency <= 0 || frequency > 1) {
      throw Exception("Found invalid frequency: ${frequency}. Frequency must be value from (0,1].")
    }
  }

  @RequiresApi(Build.VERSION_CODES.O)
  fun createVibrationEffect(props: CreateVibrationEffectProps? = null): VibrationEffect? {
    if (barsList == null && controlPointsList == null) {
      Log.w(TAG, "Vibration creation failed. No data in preset.")
      return null
    } else {
      val barsWaveform =
        barsList?.let { bars ->
          props?.frequencyProfile?.let {
            val points = convertBarsToPoints(bars)
            createWaveformFromPoints(points, it, props.envelopeInfo)
          } ?: run { createWaveformFromBars(bars) }
        }

      val pointsWaveform =
        controlPointsList?.let { points ->
          props?.frequencyProfile?.let { createWaveformFromPoints(points, it, props.envelopeInfo) }
        }

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

  @RequiresApi(Build.VERSION_CODES.O)
  fun createWaveformFromBars(bars: ArrayList<Bar>): VibrationEffect {
    var timings = longArrayOf()
    var amplitudes = intArrayOf()

    val n = bars.size
    for (i in 0..n - 1) {
      val prevBar = if (i == 0) null else bars[i - 1]
      val currBar = bars[i]

      if (prevBar != null && prevBar.x2 != currBar.x1) {
        // add pause between bars
        val pauseDuration = currBar.x1 - prevBar.x2
        timings += pauseDuration
        amplitudes += 0
      }

      val currBarDuration = currBar.x2 - currBar.x1
      timings += currBarDuration
      amplitudes += (currBar.amplitude * MAX_AMPLITUDE).roundToInt()
    }

    return VibrationEffect.createWaveform(timings, amplitudes, -1)
  }

  // TODO: check consts from envelopeInfo:
  // https://developer.android.com/reference/android/os/VibrationEffect.WaveformEnvelopeBuilder#:~:text=You%20can%20use,duration%3A%20VibratorEnvelopeEffectInfo.getMaxDurationMillis()
  fun createWaveformFromPoints(
    points: ArrayList<EnvelopePoint>,
    frequencyProfile: VibratorFrequencyProfile,
    envelopeInfo: VibratorEnvelopeEffectInfo,
  ): VibrationEffect? {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.BAKLAVA) {
      Log.w(
        TAG,
        "Failed to create waveform. Control points waveforms are supported only on Android 16",
      )
      return null
    } else {
      val minDuration = envelopeInfo.minControlPointDurationMillis

      val builder = VibrationEffect.WaveformEnvelopeBuilder()
      val n = points.size

      for (i in 1..n - 1) {
        val prevPoint = points[i - 1]
        val currPoint = points[i]

        // handle start from non zero value
        if (i == 1 && prevPoint.intensity.toInt() != 0) {
          addPointToBuilder(
            builder,
            frequencyProfile,
            envelopeInfo,
            prevPoint.intensity,
            prevPoint.sharpness,
            minDuration,
          )
        }

        val pointsTimeDiff = currPoint.relativeTime - prevPoint.relativeTime
        val duration = if (pointsTimeDiff > 0) pointsTimeDiff else minDuration

        addPointToBuilder(
          builder,
          frequencyProfile,
          envelopeInfo,
          currPoint.intensity,
          currPoint.sharpness,
          duration,
        )
      }

      return builder.build()
    }
  }

  @RequiresApi(Build.VERSION_CODES.BAKLAVA)
  fun addPointToBuilder(
    builder: VibrationEffect.WaveformEnvelopeBuilder,
    frequencyProfile: VibratorFrequencyProfile,
    envelopeInfo: VibratorEnvelopeEffectInfo,
    intensity: Float,
    sharpness: Float,
    duration: Long,
  ) {
    val minDuration = envelopeInfo.minControlPointDurationMillis
    val maxDuration = envelopeInfo.maxControlPointDurationMillis
    val adjustedDuration = max(min(duration, maxDuration), minDuration)

    val minFrequencyHz = frequencyProfile.minFrequencyHz
    val maxFrequencyHz = frequencyProfile.maxFrequencyHz
    val frequencyHz = sharpness * (maxFrequencyHz - minFrequencyHz) + minFrequencyHz

    builder.addControlPoint(intensity, frequencyHz, adjustedDuration)
  }

  fun convertBarsToPoints(bars: ArrayList<Bar>): ArrayList<EnvelopePoint> {
    val points = ArrayList<EnvelopePoint>()
    val n = bars.size

    for (i in 0..n - 1) {
      val prevBar = if (i == 0) null else bars[i - 1]
      val currBar = bars[i]

      // add empty interval at the beginning if first bar do not start at 0
      if (i == 0 && currBar.x1.toInt() != 0) {
        addIntervalEdgesToPoints(points, 0f, currBar.frequency, 0, currBar.x1)
      }

      // add empty interval between bars if they are not next to each other
      if (prevBar != null && prevBar.x2 != currBar.x1) {
        addIntervalEdgesToPoints(points, 0f, currBar.frequency, prevBar.x2, currBar.x1)
      }

      // add bar interval
      addIntervalEdgesToPoints(points, currBar.amplitude, currBar.frequency, currBar.x1, currBar.x2)
    }

    return points
  }

  fun addIntervalEdgesToPoints(
    points: ArrayList<EnvelopePoint>,
    intensity: Float,
    sharpness: Float,
    relativeTime1: Long,
    relativeTime2: Long,
  ) {
    points += EnvelopePoint(intensity, sharpness, relativeTime1)
    points += EnvelopePoint(intensity, sharpness, relativeTime2)
  }
}
