package com.swmansion.pulsarapp.types

import android.os.Build
import android.os.VibrationEffect
import android.util.Log
import androidx.annotation.RequiresApi
import com.swmansion.pulsarapp.TAG

const val MIN_TIME: Long = 20
data class Preset(
    val name: String,
    val bars: ArrayList<Bar>? = null,
    val controlPoints: ArrayList<EnvelopePoint>? = null
) {
    @RequiresApi(Build.VERSION_CODES.O)
    val vibrationEffect = createVibrationEffect()

    @RequiresApi(Build.VERSION_CODES.O)
    private fun createVibrationEffect(): VibrationEffect? {
        val barsWaveform = createWaveformFromBars()
        val pointsWaveform = createWaveformFromPoints()

        barsWaveform?.let {
            Log.i(TAG, "Vibration created based on bars.")
            return barsWaveform
        }

        pointsWaveform?.let {
            Log.i(TAG, "Vibration created based on points.")
            return pointsWaveform
        }

        Log.w(TAG, "Vibration creation failed.")
        return null
    }

    @RequiresApi(Build.VERSION_CODES.O)
    fun createWaveformFromBars(): VibrationEffect? {
        if (bars == null) {
            return null
        } else {
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
                amplitudes += currBar.amplitude
            }

            return VibrationEffect.createWaveform(timings, amplitudes, -1)
        }
    }

    fun createWaveformFromPoints(): VibrationEffect? {
        if (controlPoints == null){
            return null
        } else if (Build.VERSION.SDK_INT < Build.VERSION_CODES.BAKLAVA) {
            Log.w(TAG, "Failed to create waveform. Control points waveforms are supported only on Android 16")
            return null
        }
        else {
            val builder = VibrationEffect.WaveformEnvelopeBuilder()

            val n = controlPoints.size
            for (i in 0..n - 1) {
                val prevPoint = if (i == 0) null else controlPoints[i - 1]
                val currPoint = controlPoints[i]

                val duration = prevPoint?.let {
                    val pointsTimeDiff = currPoint.relativeTime - prevPoint.relativeTime
                    if (pointsTimeDiff > 0) pointsTimeDiff else MIN_TIME
                } ?: run {
                    currPoint.relativeTime
                }

                builder.addControlPoint(
                    currPoint.intensity,
                    currPoint.sharpness * 160, // TODO: this should be device specified
                    duration)
            }

            return builder.build()
        }
    }
}