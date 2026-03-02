package com.swmansion.pulsar.haptics

import android.os.Build
import android.os.VibrationEffect
import android.os.vibrator.VibratorFrequencyProfile
import androidx.annotation.RequiresApi
import com.swmansion.pulsar.types.CompatibilityMode
import com.swmansion.pulsar.types.ControlPoint
import kotlin.collections.plus
import kotlin.math.roundToInt

class VibrationEffectsGenerator(val engine: HapticEngineWrapper) {

    private var forcedCompatibilityMode = CompatibilityMode.ADVANCED_SUPPORT

    @RequiresApi(Build.VERSION_CODES.O)
    fun convertToVibrationEffect(controlLine: ControlLineBuilder) : VibrationEffect {
        return if (
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.BAKLAVA
            && engine.isEnvelopeSupported()
            && forcedCompatibilityMode >= CompatibilityMode.STANDARD_SUPPORT
        ) {
            val points = controlLine.getLinearPoints()
            if (engine.isFrequencyProfileSupported() && forcedCompatibilityMode == CompatibilityMode.ADVANCED_SUPPORT) {
                convertToAdvanceEnvelope(points)
            } else {
                convertToBasicEnvelope(points)
            }
        } else {
            val points = controlLine.getStepsPoints()
            if (engine.isAmplitudeSupported() && forcedCompatibilityMode >= CompatibilityMode.LIMITED_SUPPORT) {
                convertToAmplitudeWaveform(points)
            } else {
                convertToTimingWaveform(points)
            }
        }
    }

    @RequiresApi(Build.VERSION_CODES.O)
    fun convertToVibrationEffect(points: List<ControlPoint>) : VibrationEffect {
        return if (
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.BAKLAVA
            && engine.isEnvelopeSupported()
            && forcedCompatibilityMode >= CompatibilityMode.STANDARD_SUPPORT
        ) {
            if (engine.isFrequencyProfileSupported() && forcedCompatibilityMode == CompatibilityMode.ADVANCED_SUPPORT) {
                convertToAdvanceEnvelope(points)
            } else {
                convertToBasicEnvelope(points)
            }
        } else {
            if (engine.isAmplitudeSupported() && forcedCompatibilityMode >= CompatibilityMode.LIMITED_SUPPORT) {
                convertToAmplitudeWaveform(points)
            } else {
                convertToTimingWaveform(points)
            }
        }
    }

    @RequiresApi(Build.VERSION_CODES.BAKLAVA)
    private fun convertToAdvanceEnvelope(controlPoints: List<ControlPoint>): VibrationEffect {
        val builder = VibrationEffect.WaveformEnvelopeBuilder()
        if (controlPoints.isEmpty()) {
            builder.addControlPoint(0f, 1f, 1)
            return builder.build()
        }

        val frequencyProfile = engine.getFrequencyProfile()

        val initialSharpness = controlPoints.first().sharpness
        builder.setInitialFrequencyHz(getSharpnessInHz(initialSharpness, frequencyProfile!!))

        controlPoints.forEach {
            builder.addControlPoint(
                    it.intensity,
                    getSharpnessInHz(it.sharpness, frequencyProfile),
                    toMillis(it.duration),
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
        if (controlPoints.isEmpty()) {
            builder.addControlPoint(0f, 1f, 1)
            return builder.build()
        }

        val initialSharpness = controlPoints.first().sharpness

        controlPoints.forEach {
            builder
                .setInitialSharpness(initialSharpness)
                .addControlPoint(it.intensity, it.sharpness, toMillis(it.duration))
        }

        return builder.build()
    }

    @RequiresApi(Build.VERSION_CODES.O)
    private fun convertToAmplitudeWaveform(controlPoints: List<ControlPoint>): VibrationEffect {
        var timings = longArrayOf()
        var amplitudes = intArrayOf()
        val maxAmplitude = 255
        controlPoints.forEach {
            timings += toMillis(it.duration)
            amplitudes += (it.intensity * maxAmplitude).roundToInt()
        }

        return VibrationEffect.createWaveform(timings, amplitudes, -1)
    }

    @RequiresApi(Build.VERSION_CODES.O)
    private fun convertToTimingWaveform(controlPoints: List<ControlPoint>): VibrationEffect {
        var timings = longArrayOf(0)
        var isVibrating = false

        controlPoints.forEach {
            val duration = toMillis(it.duration)
            val shouldVibrate = it.intensity > 0

            if (shouldVibrate != isVibrating) {
            timings += duration
            isVibrating = shouldVibrate
            } else if (timings.isNotEmpty()) {
            timings[timings.lastIndex] += duration
            }
        }

        return VibrationEffect.createWaveform(timings, -1)
    }

    private fun toMillis(ms: Float): Long {
        return ms.toLong()
    }

    fun simulateCompatibilityMode(mode: CompatibilityMode) {
        this.forcedCompatibilityMode = mode
    }
}