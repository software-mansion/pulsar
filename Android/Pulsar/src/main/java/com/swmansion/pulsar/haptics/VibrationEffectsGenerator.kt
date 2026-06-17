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
    fun convertToVibrationEffect(controlLine: ControlLineBuilder) : VibrationEffect? {
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
    fun convertToVibrationEffect(points: List<ControlPoint>) : VibrationEffect? {
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
        if (controlPoints.isEmpty()) {
            builder.addControlPoint(0f, 1f, 1)
            return builder.build()
        }

        val initialSharpness = controlPoints.first().sharpness

        controlPoints.forEach {
            builder
                .setInitialSharpness(initialSharpness)
                .addControlPoint(it.intensity, it.sharpness, it.duration)
        }

        return builder.build()
    }

    @RequiresApi(Build.VERSION_CODES.O)
    private fun convertToAmplitudeWaveform(controlPoints: List<ControlPoint>): VibrationEffect? {
        var timings = longArrayOf()
        var amplitudes = intArrayOf()
        val maxAmplitude = 255
        controlPoints.forEach {
            timings += it.duration
            amplitudes += (it.intensity * maxAmplitude).roundToInt()
        }

        if (!hasPlayableWaveform(timings)) {
            return null
        }

        return VibrationEffect.createWaveform(timings, amplitudes, -1)
    }

    /**
     * Fallback for devices without amplitude control. Instead of collapsing every
     * non-zero control point into one solid buzz (which discards the intensity level
     * and the frequency entirely), this simulates both through PWM duty-cycling: each
     * control point's intensity becomes the ON pulse length and its sharpness becomes
     * the OFF gap, tiled across the timeline. This is the on/off-only equivalent of the
     * web PatternComposer and lets continuous presets keep a sense of strength and
     * pulse rate on older ERM phones.
     *
     * createWaveform(timings, -1) plays the array as alternating OFF, ON, OFF, ON...,
     * where the first value is the initial wait before the first vibration.
     */
    @RequiresApi(Build.VERSION_CODES.O)
    private fun convertToTimingWaveform(controlPoints: List<ControlPoint>): VibrationEffect? {
        if (controlPoints.isEmpty()) {
            return null
        }

        val totalDuration = controlPoints.sumOf { it.duration }
        if (totalDuration <= 0L) {
            return null
        }

        val timings = arrayListOf(0L)
        var lastIsOn = false

        fun append(duration: Long, isOn: Boolean) {
            if (duration <= 0L) {
                return
            }
            if (isOn == lastIsOn) {
                timings[timings.lastIndex] += duration
            } else {
                timings.add(duration)
                lastIsOn = isOn
            }
        }

        var cursor = 0L
        var index = 0
        var segmentEnd = controlPoints[0].duration

        while (cursor < totalDuration) {
            while (index < controlPoints.lastIndex && cursor >= segmentEnd) {
                index++
                segmentEnd += controlPoints[index].duration
            }
            val point = controlPoints[index]

            if (point.intensity <= 0f) {
                // Silence: stay off until the end of this control point (or the pattern).
                val gap = minOf(segmentEnd, totalDuration) - cursor
                append(gap, false)
                cursor += gap
                continue
            }

            val remaining = totalDuration - cursor
            val shot = minOf(PwmTimingSimulator.shotLength(point.intensity, remaining), remaining)
            append(shot, true)
            cursor += shot

            if (cursor < totalDuration) {
                val pauseBudget = totalDuration - cursor
                val pause = minOf(PwmTimingSimulator.pauseLength(point.sharpness, pauseBudget), pauseBudget)
                append(pause, false)
                cursor += pause
            }
        }

        val result = timings.toLongArray()
        if (!hasPlayableWaveform(result)) {
            return null
        }

        return VibrationEffect.createWaveform(result, -1)
    }

    private fun hasPlayableWaveform(timings: LongArray): Boolean {
        return timings.isNotEmpty() && timings.any { it > 0L }
    }

    fun simulateCompatibilityMode(mode: CompatibilityMode) {
        this.forcedCompatibilityMode = mode
    }
}
