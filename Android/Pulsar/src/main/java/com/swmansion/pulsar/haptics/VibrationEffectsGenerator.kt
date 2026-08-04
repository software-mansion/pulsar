package com.swmansion.pulsar.haptics

import android.os.Build
import android.os.VibrationEffect
import android.os.vibrator.VibratorFrequencyProfile
import androidx.annotation.RequiresApi
import com.swmansion.pulsar.types.CompatibilityMode
import com.swmansion.pulsar.types.ConfigPoint
import com.swmansion.pulsar.types.ControlPoint
import kotlin.collections.plus
import kotlin.math.roundToInt

class VibrationEffectsGenerator(val engine: HapticEngineWrapper) {

    private var forcedCompatibilityMode = CompatibilityMode.ADVANCED_SUPPORT

    @RequiresApi(Build.VERSION_CODES.O)
    fun convertToVibrationEffect(controlLine: ControlLineBuilder) : VibrationEffect? {
        if (
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.BAKLAVA
            && engine.isEnvelopeSupported()
            && forcedCompatibilityMode >= CompatibilityMode.STANDARD_SUPPORT
        ) {
            return buildEnvelope(controlLine.getLinearPoints())
        }

        val points = controlLine.getStepsPoints()
        return if (usesAmplitudeWaveform()) {
            convertToAmplitudeWaveform(points)
        } else {
            convertToPwmWaveform(points)
        }
    }

    @RequiresApi(Build.VERSION_CODES.O)
    fun convertToVibrationEffect(points: List<ControlPoint>) : VibrationEffect? {
        if (
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.BAKLAVA
            && engine.isEnvelopeSupported()
            && forcedCompatibilityMode >= CompatibilityMode.STANDARD_SUPPORT
        ) {
            return buildEnvelope(points)
        }

        return if (usesAmplitudeWaveform()) {
            convertToAmplitudeWaveform(points)
        } else {
            convertToPwmWaveform(points)
        }
    }

    @RequiresApi(Build.VERSION_CODES.O)
    fun convertToImpulseTimingWaveform(impulses: List<ConfigPoint>): VibrationEffect? {
        val timings = pwmGenerator.buildImpulseTimings(impulses) ?: return null
        return VibrationEffect.createWaveform(timings, -1)
    }

    fun resolvesToTimingWaveform(): Boolean {
        val usesEnvelope = Build.VERSION.SDK_INT >= Build.VERSION_CODES.BAKLAVA &&
            engine.isEnvelopeSupported() &&
            forcedCompatibilityMode >= CompatibilityMode.STANDARD_SUPPORT
        return !usesEnvelope && !usesAmplitudeWaveform()
    }

    private fun usesAmplitudeWaveform(): Boolean =
        engine.isAmplitudeSupported() && forcedCompatibilityMode >= CompatibilityMode.STANDARD_SUPPORT

    @RequiresApi(Build.VERSION_CODES.BAKLAVA)
    private fun buildEnvelope(points: List<ControlPoint>): VibrationEffect {
        return if (engine.isFrequencyProfileSupported() && forcedCompatibilityMode == CompatibilityMode.ADVANCED_SUPPORT) {
            convertToAdvanceEnvelope(points)
        } else {
            convertToBasicEnvelope(points)
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

    @RequiresApi(Build.VERSION_CODES.O)
    private fun convertToPwmWaveform(controlPoints: List<ControlPoint>): VibrationEffect? {
        val timings = pwmGenerator.buildPwmTimings(controlPoints) ?: return null
        return VibrationEffect.createWaveform(timings, -1)
    }

    private val pwmGenerator: PwmHapticsGenerator =
        PwmHapticsGenerator.forActuator(engine.getMinControlPointDurationMillis())

    private fun hasPlayableWaveform(timings: LongArray): Boolean {
        return timings.isNotEmpty() && timings.any { it > 0L }
    }

    fun simulateCompatibilityMode(mode: CompatibilityMode) {
        this.forcedCompatibilityMode = mode
    }
}
