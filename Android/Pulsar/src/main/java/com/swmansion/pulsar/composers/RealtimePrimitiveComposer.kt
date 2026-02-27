package com.swmansion.pulsar.composers

import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.VibrationEffect
import androidx.annotation.RequiresApi
import com.swmansion.pulsar.haptics.HapticEngineWrapper
import com.swmansion.pulsar.types.RealtimeComposable
import com.swmansion.pulsar.types.RealtimeComposerStrategy

class RealtimePrimitiveComposer(
    private val engine: HapticEngineWrapper,
    private val strategy: RealtimeComposerStrategy
) : RealtimeComposable {
    companion object {
        private const val MIN_INTERVAL_MS = 10L
        private const val MAX_INTERVAL_MS = 100L
    }

    private var isPlaying = false
    private var isDiscreteScheduled = false
    private var currentAmplitude = 0.0f
    private var currentFrequency = 0.0f
    private var currentIntervalMs: Long = 50L

    private val handler = Handler(Looper.getMainLooper())
    private val loopRunnable = Runnable { loop() }

    private fun start(amplitude: Float, frequency: Float) {
        if (isPlaying) {
            stop()
        }

        isPlaying = true
        set(amplitude, frequency)
        loop()
    }

    override fun set(amplitude: Float, frequency: Float) {
        if (isDiscreteScheduled) {
            return
        }
        currentAmplitude = amplitude.coerceIn(0f, 1f)
        currentFrequency = frequency.coerceIn(0f, 1f)
        currentIntervalMs = (MIN_INTERVAL_MS + (1 - frequency) * (MAX_INTERVAL_MS - MIN_INTERVAL_MS)).toLong()

        if (!isPlaying) {
            start(currentAmplitude, currentFrequency)
        }
    }

    override fun playDiscrete(amplitude: Float, frequency: Float) {
        set(amplitude, frequency)
        isDiscreteScheduled = true
    }

    override fun stop() {
        if (!isPlaying) return

        isPlaying = false
        handler.removeCallbacks(loopRunnable)
        engine.stop()
    }

    override fun isActive(): Boolean = isPlaying

    private fun loop() {
        if (!isPlaying || Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return
        }

        val effect = createCompositionEffect(currentAmplitude, currentFrequency)

        if (isDiscreteScheduled) {
            isDiscreteScheduled = false
        }

        engine.vibrate(effect)

        handler.postDelayed(loopRunnable, currentIntervalMs)
    }

    @RequiresApi(Build.VERSION_CODES.O)
    private fun createCompositionEffect(amplitude: Float, frequency: Float): VibrationEffect {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            VibrationEffect.startComposition()
                .addPrimitive(
                    selectPrimitive(frequency),
                    amplitude,
                    0
                ).compose()
        } else {
            VibrationEffect.createOneShot(currentIntervalMs, (amplitude * 255).toInt().coerceIn(0, 255))
        }
    }

    @RequiresApi(Build.VERSION_CODES.TIRAMISU)
    private fun selectPrimitive(value: Float): Int {
        if (strategy == RealtimeComposerStrategy.PRIMITIVE_TICK) {
            return VibrationEffect.Composition.PRIMITIVE_TICK
        }
        return when {
            value > 0.75f -> VibrationEffect.Composition.PRIMITIVE_TICK
            value > 0.50f -> VibrationEffect.Composition.PRIMITIVE_SPIN
            value > 0.25f -> VibrationEffect.Composition.PRIMITIVE_THUD
            else -> VibrationEffect.Composition.PRIMITIVE_LOW_TICK
        }
    }
}