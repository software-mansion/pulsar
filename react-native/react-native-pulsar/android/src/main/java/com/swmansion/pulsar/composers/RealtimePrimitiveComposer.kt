package com.swmansion.pulsar.composers

import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.VibrationEffect
import androidx.annotation.RequiresApi
import com.swmansion.pulsar.haptics.HapticEngineWrapper
import com.swmansion.pulsar.types.CompatibilityMode
import com.swmansion.pulsar.types.RealtimeComposable

open class RealtimePrimitiveComposer(
    private val engine: HapticEngineWrapper,
    compatibilityMode: CompatibilityMode,
) : RealtimeComposable {
    private var minIntervalMs = 10L
    private var maxIntervalMs = 100L

    init {
        if (compatibilityMode == CompatibilityMode.MINIMAL_SUPPORT) {
            minIntervalMs = 60L
            maxIntervalMs = 200L
        }
    }

    private var isPlaying = false
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
        currentAmplitude = amplitude.coerceIn(0f, 1f)
        currentFrequency = frequency.coerceIn(0f, 1f)
        currentIntervalMs = (minIntervalMs + (1 - frequency) * (maxIntervalMs - minIntervalMs)).toLong()

        if (!isPlaying) {
            start(currentAmplitude, currentFrequency)
        }
    }

    override fun playDiscrete(amplitude: Float, frequency: Float) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return
        }
        val effect = createCompositionEffect(amplitude, frequency)
        engine.vibrate(effect)
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
        engine.vibrate(effect)
        handler.postDelayed(loopRunnable, currentIntervalMs)
    }

    @RequiresApi(Build.VERSION_CODES.O)
    protected fun createCompositionEffect(amplitude: Float, frequency: Float): VibrationEffect {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            VibrationEffect.startComposition()
                .addPrimitive(
                    selectPrimitive(frequency),
                    amplitude,
                    0
                ).compose()
        } else {
            VibrationEffect.createOneShot(10, (amplitude * 255).toInt().coerceIn(0, 255))
        }
    }

    @RequiresApi(Build.VERSION_CODES.TIRAMISU)
    protected open fun selectPrimitive(value: Float): Int {
        return VibrationEffect.Composition.PRIMITIVE_TICK
    }
}
