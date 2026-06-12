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
    private var minIntervalMs = 10L
    private var maxIntervalMs = 100L

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
    @Volatile private var lastSetAtMs = 0L

    private val handler = Handler(Looper.getMainLooper())
    private val loopRunnable = Runnable { loop() }

    companion object {
        /**
         * Auto-stop the self-reposting loop if no [set] arrives within this window.
         * Playback only ends on an explicit [stop], so a driver that goes silent — or a
         * stale [Handler] callback resurrected after [stop] — would otherwise vibrate
         * indefinitely. The keepalive bounds that worst case to a short, fixed tail.
         */
        private const val KEEPALIVE_MS = 400L
    }

    override fun set(amplitude: Float, frequency: Float) {
        currentAmplitude = amplitude.coerceIn(0f, 1f)
        currentFrequency = frequency.coerceIn(0f, 1f)
        currentIntervalMs = (minIntervalMs + (1 - frequency) * (maxIntervalMs - minIntervalMs)).toLong()
        lastSetAtMs = SystemClock.uptimeMillis()
        if (!isPlaying.get()) {
            start()
        }
    }

    private fun start() {
        if (!isPlaying.compareAndSet(false, true)) return
        lastSetAtMs = SystemClock.uptimeMillis()
        loop()
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

        if (SystemClock.uptimeMillis() - lastSetAtMs > KEEPALIVE_MS) {
            // No fresh set within the keepalive window — the driver went silent (or this
            // is a stale callback that slipped past stop()); self-terminate.
            stop()
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
