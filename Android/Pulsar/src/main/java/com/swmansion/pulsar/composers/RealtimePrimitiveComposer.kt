package com.swmansion.pulsar.composers

import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.VibrationEffect
import androidx.annotation.RequiresApi
import com.swmansion.pulsar.haptics.HapticEngineWrapper
import com.swmansion.pulsar.haptics.PwmTimingSimulator
import com.swmansion.pulsar.types.CompatibilityMode
import com.swmansion.pulsar.types.RealtimeComposable
import java.util.concurrent.atomic.AtomicBoolean

open class RealtimePrimitiveComposer(
    private val engine: HapticEngineWrapper,
    compatibilityMode: CompatibilityMode,
) : RealtimeComposable {
    private var minIntervalMs = 10L
    private var maxIntervalMs = 100L

    // On no-amplitude devices below API 33 the system ignores createOneShot's amplitude
    // argument, so intensity is simulated through the PWM pulse length instead, mirroring
    // the web RealtimeComposer. API 33+ keeps using scalable composition primitives.
    private val usesPwmFallback =
        compatibilityMode == CompatibilityMode.LIMITED_SUPPORT &&
            Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU

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

    private val handler = Handler(Looper.getMainLooper())
    private val loopRunnable = Runnable { loop() }

    override fun start() {
        if (!isPlaying.compareAndSet(false, true)) return
        loop()
    }

    override fun set(amplitude: Float, frequency: Float, startIfNeeded: Boolean) {
        if (!isPlaying.get()) {
            if (!startIfNeeded) return
            start()
            if (!isPlaying.get()) return
        }
        currentAmplitude = amplitude.coerceIn(0f, 1f)
        currentFrequency = frequency.coerceIn(0f, 1f)
        currentIntervalMs = if (usesPwmFallback) {
            // PWM cycle: the ON pulse encodes intensity, the OFF gap encodes frequency.
            PwmTimingSimulator.shotLength(currentAmplitude) +
                PwmTimingSimulator.pauseLength(currentFrequency)
        } else {
            (minIntervalMs + (1 - frequency) * (maxIntervalMs - minIntervalMs)).toLong()
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
        if (!isPlaying.compareAndSet(true, false)) return

        handler.removeCallbacks(loopRunnable)
        engine.stop()
    }

    override fun isActive(): Boolean = isPlaying.get()

    private fun loop() {
        if (!isPlaying.get() || Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return
        }

        // On the PWM fallback a zero-intensity tick is silence: skip the pulse but keep
        // the loop alive so intensity can rise again on the next set().
        if (!usesPwmFallback || currentAmplitude > 0f) {
            val effect = createCompositionEffect(currentAmplitude, currentFrequency)
            engine.vibrate(effect)
        }
        handler.postDelayed(loopRunnable, currentIntervalMs.coerceAtLeast(1L))
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
        } else if (usesPwmFallback) {
            // No amplitude control: encode intensity as the ON pulse length (PWM duty cycle).
            VibrationEffect.createOneShot(
                PwmTimingSimulator.shotLength(amplitude).coerceAtLeast(1L),
                255
            )
        } else {
            VibrationEffect.createOneShot(10, (amplitude * 255).toInt().coerceIn(0, 255))
        }
    }

    @RequiresApi(Build.VERSION_CODES.TIRAMISU)
    protected open fun selectPrimitive(value: Float): Int {
        return VibrationEffect.Composition.PRIMITIVE_TICK
    }
}
