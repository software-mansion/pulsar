package com.swmansion.pulsarapp

import android.os.Build
import android.os.VibrationEffect
import android.os.vibrator.VibratorEnvelopeEffectInfo
import android.os.vibrator.VibratorFrequencyProfile
import android.util.Log
import androidx.annotation.RequiresApi
import com.swmansion.pulsarapp.types.Bar
import com.swmansion.pulsarapp.types.EnvelopePoint
import com.swmansion.pulsarapp.types.Preset
import kotlin.collections.forEach
import kotlin.collections.plusAssign
import kotlin.math.abs
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

const val MAX_AMPLITUDE = 255
const val STEPS_PER_100_MS = 30
const val DEFAULT_FREQUENCY = 1f

data class CreateVibrationEffectProps(
  val frequencyProfile: VibratorFrequencyProfile? = null,
  val envelopeInfo: VibratorEnvelopeEffectInfo,
)

class VibrationBuilder {
  fun createVibrationEffect(
    preset: Preset,
    props: CreateVibrationEffectProps? = null,
  ): VibrationEffect? {
    val (_, bars, points) = preset

    if (bars == null && points == null) {
      Log.w(TAG, "Vibration creation failed. No data in preset.")
      return null
    } else if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      Log.w(TAG, "Vibration not supported on version before 26 yet.") // TODO: handle somehow
      return null
    } else {
      if (bars != null && points != null) {
        val complexWaveform = createComplexWaveform(points, bars, props)

        Log.i(TAG, "Complex vibration created based on bars and points.")
        return complexWaveform
      } else {
        val barsWaveform = bars?.let { createWaveformFromBars(it, props) }
        val pointsWaveform = points?.let { createWaveformFromPoints(it, props) }

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
  private fun createWaveformFromBars(
    bars: ArrayList<Bar>,
    props: CreateVibrationEffectProps?,
  ): VibrationEffect {
    return if (supportAndroid36() && props != null) {
      val points = convertBarsToPoints(bars)
      createEnvelopeWaveform(points, props)
    } else createWaveform(bars)
  }

  @RequiresApi(Build.VERSION_CODES.O)
  private fun createWaveformFromPoints(
    points: ArrayList<EnvelopePoint>,
    props: CreateVibrationEffectProps?,
  ): VibrationEffect? {
    return if (supportAndroid36() && props != null) createEnvelopeWaveform(points, props)
    else {
      val bars = convertPointsToBars(points)
      createWaveform(bars)
    }
  }

  @RequiresApi(Build.VERSION_CODES.O)
  private fun createComplexWaveform(
    points: ArrayList<EnvelopePoint>,
    bars: ArrayList<Bar>,
    props: CreateVibrationEffectProps?,
  ): VibrationEffect? {
    val mergedPoints = mergePointsAndBars(bars, points)
    return createWaveformFromPoints(mergedPoints, props)
  }

  @RequiresApi(Build.VERSION_CODES.O)
  private fun createWaveform(bars: ArrayList<Bar>): VibrationEffect {
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
  private fun createEnvelopeWaveform(
    points: ArrayList<EnvelopePoint>,
    props: CreateVibrationEffectProps,
  ): VibrationEffect {
    val controlPoints = getControlPoints(points, props)

    return props.frequencyProfile?.let {
      val builder = VibrationEffect.WaveformEnvelopeBuilder()
      controlPoints.forEach { builder.addControlPoint(it.intensity, it.sharpness, it.relativeTime) }
      builder.build()
    }
      ?: run {
        val builder = VibrationEffect.BasicEnvelopeBuilder()
        controlPoints.forEach {
          builder.addControlPoint(it.intensity, it.sharpness, it.relativeTime)
        }
        builder.build()
      }
  }

  @RequiresApi(Build.VERSION_CODES.BAKLAVA)
  private fun getControlPoints(
    points: ArrayList<EnvelopePoint>,
    props: CreateVibrationEffectProps,
  ): ArrayList<EnvelopePoint> {
    val controlPoints = ArrayList<EnvelopePoint>()
    val n = points.size
    val minDuration = props.envelopeInfo.minControlPointDurationMillis

    for (i in 0..n - 1) {
      val currPoint = points[i]

      if (i == 0) {
        // handle start from non zero amplitude
        if (currPoint.intensity != 0f) {
          controlPoints +=
            createControlPoint(props, currPoint.intensity, currPoint.sharpness, minDuration)
        }
      } else {
        // handle transition between points
        val prevPoint = points[i - 1]
        val pointsTimeDiff = currPoint.relativeTime - prevPoint.relativeTime
        val duration = if (pointsTimeDiff > 0) pointsTimeDiff else minDuration

        controlPoints +=
          createControlPoint(props, currPoint.intensity, currPoint.sharpness, duration)
      }
    }

    return controlPoints
  }

  @RequiresApi(Build.VERSION_CODES.BAKLAVA)
  private fun createControlPoint(
    props: CreateVibrationEffectProps,
    intensity: Float,
    sharpness: Float,
    duration: Long,
  ): EnvelopePoint {
    val envelopeInfo = props.envelopeInfo
    val frequencyProfile = props.frequencyProfile

    val minDuration = envelopeInfo.minControlPointDurationMillis
    val maxDuration = envelopeInfo.maxControlPointDurationMillis
    val adjustedDuration = max(min(duration, maxDuration), minDuration)

    val adjustedFrequency =
      frequencyProfile?.let {
        val minFrequencyHz = it.minFrequencyHz
        val maxFrequencyHz = it.maxFrequencyHz
        sharpness * (maxFrequencyHz - minFrequencyHz) + minFrequencyHz
      } ?: sharpness

    return EnvelopePoint(intensity, adjustedFrequency, adjustedDuration)
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

  private fun convertPointsToBars(points: ArrayList<EnvelopePoint>): ArrayList<Bar> {
    val bars = ArrayList<Bar>()

    val n = points.size
    for (i in 1..n - 1) {
      val currPoint = points[i]
      val prevPoint = points[i - 1]

      // when prevPoint.relativeTime == currPoint.relativeTime skip (vertical lines)

      if (prevPoint.intensity == currPoint.intensity) {
        bars +=
          Bar(
            prevPoint.relativeTime,
            currPoint.relativeTime,
            currPoint.intensity,
            DEFAULT_FREQUENCY, // frequency of this bar will never be used
          )
      } else if (prevPoint.relativeTime != currPoint.relativeTime) {
        val intervalDuration = currPoint.relativeTime - prevPoint.relativeTime

        val startIntensity = prevPoint.intensity
        val endIntensity = currPoint.intensity

        val steps = (intervalDuration * STEPS_PER_100_MS) / 100
        val stepDuration = intervalDuration / steps
        val stepValue = abs(startIntensity - endIntensity) / steps

        val isAscending = startIntensity < endIntensity

        for (i in 0..steps - 1) {
          val startTime = prevPoint.relativeTime + stepDuration * i
          val endTime = if (i < steps - 1) startTime + stepDuration else currPoint.relativeTime
          val amplitude =
            if (isAscending) startIntensity + stepValue * i else startIntensity - stepValue * i

          bars += Bar(startTime, endTime, amplitude, DEFAULT_FREQUENCY)
        }
      }
    }

    return bars
  }

  private fun supportAndroid36(): Boolean {
    return Build.VERSION.SDK_INT >= Build.VERSION_CODES.BAKLAVA
  }

  fun mergePointsAndBars(
    bars: ArrayList<Bar>,
    points: ArrayList<EnvelopePoint>,
  ): ArrayList<EnvelopePoint> {
    val pointsMap = getBarsWithinLineMap(points, bars)
    val resultPoints: ArrayList<EnvelopePoint> = arrayListOf()
    val n = points.size

    for (i in 1..n - 1) {
      val startLinePoint = points[i - 1]
      val endLinePoint = points[i]

      resultPoints += startLinePoint

      val (a, b) = getLineParameters(startLinePoint, endLinePoint)
      val barsWithinLine = pointsMap[startLinePoint]!!

      for (bar in barsWithinLine) {
        val startBarPoint = EnvelopePoint(bar.amplitude, bar.frequency, bar.x1)
        val endBarPoint = EnvelopePoint(bar.amplitude, bar.frequency, bar.x2)

        val startIntersectionPoint = getIntersectionPoint(a, b, startBarPoint)
        val endIntersectionPoint = getIntersectionPoint(a, b, endBarPoint)

        if (
          startIntersectionPoint.intensity < startBarPoint.intensity &&
            endIntersectionPoint.intensity < endBarPoint.intensity
        ) {
          if (startLinePoint.relativeTime != startIntersectionPoint.relativeTime) {
            resultPoints += startIntersectionPoint
          }
          resultPoints += startBarPoint
          resultPoints += endBarPoint
          if (endLinePoint.relativeTime != endIntersectionPoint.relativeTime) {
            resultPoints += endIntersectionPoint
          }
        }
      }

      if (i == n - 1) {
        resultPoints += endLinePoint
      }
    }
    return resultPoints
  }

  fun getBarsWithinLineMap(
    points: ArrayList<EnvelopePoint>,
    bars: ArrayList<Bar>,
  ): Map<EnvelopePoint, ArrayList<Bar>> {
    val barsWithinLineMap = mutableMapOf<EnvelopePoint, ArrayList<Bar>>()
    val n = points.size
    var currBarIndex = 0

    for (i in 1..n - 1) {
      val prevPoint = points[i - 1]
      val currPoint = points[i]
      val lineBars = ArrayList<Bar>()

      for (j in currBarIndex..bars.size - 1) {
        val bar = bars[j]
        if (prevPoint.relativeTime <= bar.x1 && bar.x2 <= currPoint.relativeTime) {
          lineBars += bar
          currBarIndex += 1
        } else {
          break
        }
      }

      barsWithinLineMap[prevPoint] = lineBars
    }

    return barsWithinLineMap
  }

  fun getLineParameters(point1: EnvelopePoint, point2: EnvelopePoint): Pair<Float, Float> {
    val x1 = point1.relativeTime.toFloat()
    val x2 = point2.relativeTime.toFloat()

    val y1 = point1.intensity
    val y2 = point2.intensity

    val a = (y2 - y1) / (x2 - x1)
    val b = y1 - a * x1

    return (a to b)
  }

  // intersection between y = ax + b and y = x (point)
  fun getIntersectionPoint(a: Float, b: Float, point: EnvelopePoint): EnvelopePoint {
    val x = point.relativeTime.toFloat()
    val y = a * x + b

    return EnvelopePoint(y, point.sharpness, x.toLong())
  }
}
