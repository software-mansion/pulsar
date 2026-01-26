package com.swmansion.pulsar.haptics

import android.os.Build
import android.os.VibrationEffect
import android.os.vibrator.VibratorFrequencyProfile
import androidx.annotation.RequiresApi
import com.swmansion.pulsar.types.ControlPoint
import kotlin.collections.plus
import kotlin.math.roundToInt

class VibrationEffectsGenerator(val engine: HapticEngineWrapper) {
    fun convertToVibrationEffect(controlPoints: List<ControlPoint>) : VibrationEffect {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.BAKLAVA) {
            if (engine.isFrequencyProfileSupported()) {
                convertToAdvanceEnvelope(controlPoints)
            } else {
                convertToBasicEnvelope(controlPoints)
            }
        } else {
            if (engine.isAmplitudeSupported()) {
                convertToAmplitudeWaveform(controlPoints)
            } else {
                convertToTimingWaveform(controlPoints)
            }
        }
    }

    @RequiresApi(Build.VERSION_CODES.BAKLAVA)
    private fun convertToAdvanceEnvelope(controlPoints: List<ControlPoint>): VibrationEffect {
        val frequencyProfile = engine.getFrequencyProfile()
        val builder = VibrationEffect.WaveformEnvelopeBuilder()

        val initialSharpness = controlPoints[0].sharpness
        builder.setInitialFrequencyHz(getSharpnessInHz(initialSharpness, frequencyProfile!!))

        controlPoints.forEach {
            builder.addControlPoint(
                    it.intensity,
                    getSharpnessInHz(it.sharpness, frequencyProfile),
                    it.duration,
                )
        }

        return builder.build()
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

    @RequiresApi(Build.VERSION_CODES.BAKLAVA)
    private fun convertToBasicEnvelope(controlPoints: List<ControlPoint>): VibrationEffect {
        val builder = VibrationEffect.BasicEnvelopeBuilder()

        val initialSharpness = controlPoints[0].sharpness

        controlPoints.forEach {
            builder
                .setInitialSharpness(initialSharpness)
                .addControlPoint(it.intensity, it.sharpness, it.duration)
        }

        return builder.build()
    }

    @RequiresApi(Build.VERSION_CODES.O)
    private fun convertToAmplitudeWaveform(controlPoints: List<ControlPoint>): VibrationEffect {
        var timings = longArrayOf()
        var amplitudes = intArrayOf()
        val maxAmplitude = 255
        controlPoints.forEach {
            timings += it.duration
            amplitudes += (it.intensity * maxAmplitude).roundToInt()
        }

        return VibrationEffect.createWaveform(timings, amplitudes, -1)
    }

    @RequiresApi(Build.VERSION_CODES.O)
    private fun convertToTimingWaveform(controlPoints: List<ControlPoint>): VibrationEffect {
        var timings = longArrayOf()

        controlPoints.forEach {
            timings += it.duration
        }

        return VibrationEffect.createWaveform(timings, -1)
    }
}