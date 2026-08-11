package com.swmansion.pulsar.composers

import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.os.VibrationEffect
import androidx.annotation.RequiresApi
import com.swmansion.pulsar.haptics.HapticEngineWrapper
import com.swmansion.pulsar.types.CompatibilityMode
import com.swmansion.pulsar.types.RealtimeComposable
import java.util.concurrent.atomic.AtomicBoolean

open class RealtimePrimitiveComposer(
    private val engine: HapticEngineWrapper,
    compatibilityMode: CompatibilityMode,
) : RealtimeComposable {
    protected var minIntervalMs = 10L
    protected var maxIntervalMs = 100L

    private val pwmFallback: RealtimePwmComposer? =
        if (engine.hasPrimitiveSupport()) null else RealtimePwmComposer(engine)

    init {
        if (compatibilityMode == CompatibilityMode.LIMITED_SUPPORT) {
            minIntervalMs = 60L
            maxIntervalMs = 200L
        }
    }

    private val isPlaying = AtomicBoolean(false)
    @Volatile private var currentAmplitude = 0.0f
    @Volatile private var currentFrequency = 0.0f
    @Volatile private var currentIntervalMs: Long = 50L
    @Volatile private var lastDiscreteAtMs: Long = 0L

    private val handler = Handler(Looper.getMainLooper())
    private val loopRunnable = Runnable { loop() }

    private fun start(amplitude: Float, frequency: Float) {
        if (isPlaying.get()) {
            stop()
        }

        isPlaying.set(true)
        set(amplitude, frequency)
        loop()
    }

    override fun set(amplitude: Float, frequency: Float) {
        if (pwmFallback != null) {
            pwmFallback.set(amplitude, frequency)
            return
        }

        currentAmplitude = amplitude.coerceIn(0f, 1f)
        currentFrequency = frequency.coerceIn(0f, 1f)
        currentIntervalMs = intervalForFrequency(frequency)

        if (!isPlaying.get()) {
            start(currentAmplitude, currentFrequency)
        }
    }

    override fun playDiscrete(amplitude: Float, frequency: Float) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return
        }

        if (pwmFallback != null) {
            val now = SystemClock.uptimeMillis()
            if (now - lastDiscreteAtMs < intervalForFrequency(frequency)) {
                return
            }
            lastDiscreteAtMs = now

            pwmFallback.playDiscrete(amplitude, frequency)
            return
        }

        val effect = createCompositionEffect(amplitude, frequency)
        engine.vibrate(effect)
    }

    private fun intervalForFrequency(frequency: Float): Long {
        val clamped = frequency.coerceIn(0f, 1f)
        return (minIntervalMs + (1 - clamped) * (maxIntervalMs - minIntervalMs)).toLong()
    }

    override fun stop() {
        if (pwmFallback != null) {
            pwmFallback.stop()
            return
        }

        if (!isPlaying.compareAndSet(true, false)) return

        handler.removeCallbacks(loopRunnable)
        engine.stop()
    }

    override fun isActive(): Boolean {
        if (pwmFallback != null) return pwmFallback.isActive()
        return isPlaying.get()
    }

    private fun loop() {
        if (!isPlaying.get() || Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
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
