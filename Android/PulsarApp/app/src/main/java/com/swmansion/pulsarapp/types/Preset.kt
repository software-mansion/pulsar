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

    controlPointsList?.let {
      val n = controlPointsList.size
      val firstPoint = if (n > 0) controlPointsList[0] else null
      firstPoint?.let {
        if (it.relativeTime != 0.toLong()) {
          throw Exception("Found invalid controlPointsList. First element relativeTime must be 0.")
        } else if (n == 1) {
          throw Exception("Found invalid controlPointsList. It must contain at least two points.")
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

  fun createVibrationEffect(props: CreateVibrationEffectProps? = null): VibrationEffect? {
    if (barsList == null && controlPointsList == null) {
      Log.w(TAG, "Vibration creation failed. No data in preset.")
      return null
    } else if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      Log.w(TAG, "Vibration not supported on version before 26 yet")
      return null
    } else {
      val barsWaveform =
        barsList?.let { bars ->
          if (
            supportAndroid36() && props?.frequencyProfile != null
          ) // TODO: handle null frequency better
           createBarWaveform36(bars, props.frequencyProfile, props.envelopeInfo)
          else createBarWaveform26(bars)
        }

      val pointsWaveform =
        controlPointsList?.let { points ->
          if (supportAndroid36() && props?.frequencyProfile != null)
            createPointsWaveform36(points, props.frequencyProfile, props.envelopeInfo)
          else null // TODO: handle somehow
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
  fun createBarWaveform26(bars: ArrayList<Bar>): VibrationEffect {
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

  @RequiresApi(Build.VERSION_CODES.BAKLAVA)
  fun createBarWaveform36(
    bars: ArrayList<Bar>,
    frequencyProfile: VibratorFrequencyProfile,
    envelopeInfo: VibratorEnvelopeEffectInfo,
  ): VibrationEffect {
    val points = convertBarsToPoints(bars)
    return createPointsWaveform36(points, frequencyProfile, envelopeInfo)
  }

  @RequiresApi(Build.VERSION_CODES.BAKLAVA)
  fun createPointsWaveform36(
    points: ArrayList<EnvelopePoint>,
    frequencyProfile: VibratorFrequencyProfile,
    envelopeInfo: VibratorEnvelopeEffectInfo,
  ): VibrationEffect {
    val minDuration = envelopeInfo.minControlPointDurationMillis
    val builder = VibrationEffect.WaveformEnvelopeBuilder()
    val n = points.size

    for (i in 0..n - 1) {
      val currPoint = points[i]

      if (i == 0) {
        // handle start from non zero amplitude
        if (currPoint.intensity != 0f) {
          addPointToBuilder(
            builder,
            frequencyProfile,
            envelopeInfo,
            currPoint.intensity,
            currPoint.sharpness,
            minDuration,
          )
        }
      } else {
        // handle transition between points
        val prevPoint = points[i - 1]
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
    }

    return builder.build()
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

    // TODO: better validation
    val validBars = bars.filter { it.amplitude != 0f }

    // create empty interval at the beginning
    if (validBars.isNotEmpty() && validBars[0].x1 != 0L) {
      points += EnvelopePoint(0f, 0f, 0)
    }

    for (i in 0..n - 1) {
      val currBar = validBars[i]

      if (i == 0 || validBars[i - 1].x2 != currBar.x1) {
        points += EnvelopePoint(0f, currBar.frequency, currBar.x1)
      }

      points += EnvelopePoint(currBar.amplitude, currBar.frequency, currBar.x1)
      points += EnvelopePoint(currBar.amplitude, currBar.frequency, currBar.x2)

      if (i == n - 1 || currBar.x2 != validBars[i + 1].x1) {
        points += EnvelopePoint(0f, currBar.frequency, currBar.x2)
      }
    }

    return points
  }

  private fun supportAndroid36(): Boolean {
    return Build.VERSION.SDK_INT >= Build.VERSION_CODES.BAKLAVA
  }
}
