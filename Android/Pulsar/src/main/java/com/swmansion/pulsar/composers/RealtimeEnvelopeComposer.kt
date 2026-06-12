package com.swmansion.pulsar.composers

import android.os.Build
import android.os.SystemClock
import com.swmansion.pulsar.haptics.HapticEngineWrapper
import com.swmansion.pulsar.haptics.VibrationEffectsGenerator
import com.swmansion.pulsar.types.ControlPoint
import com.swmansion.pulsar.types.RealtimeComposable
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.util.concurrent.atomic.AtomicBoolean

open class RealtimeEnvelopeComposer(
    private val engine: HapticEngineWrapper
) : RealtimeComposable {

    var vibrationEffectsGenerator = VibrationEffectsGenerator(engine)

    companion object {
        private const val SEGMENT_DURATION_MS = 100L

        /**
         * Auto-stop the simulated continuous playback if no [set] arrives within this
         * window. "Continuous" mode here is a software loop that only ends on an explicit
         * [stop], so a driver that goes silent while playing (or a stale loop iteration
         * resurrected after [stop]) would otherwise vibrate indefinitely. The keepalive
         * bounds that worst case to a short, fixed tail.
         */
        private const val KEEPALIVE_MS = 400L
    }

    private val isPlaying = AtomicBoolean(false)
    @Volatile private var currentAmplitude = 0.0f
    @Volatile private var currentFrequency = 0.0f
    @Volatile private var lastSetAtMs = 0L
    private var schedulerJob: Job? = null
    private val scope = CoroutineScope(Dispatchers.Default)

    override fun set(amplitude: Float, frequency: Float) {
        currentAmplitude = amplitude.coerceIn(0f, 1f)
        currentFrequency = frequency.coerceIn(0f, 1f)
        lastSetAtMs = SystemClock.uptimeMillis()
        if (!isPlaying.get()) {
            start()
        }
    }

    private fun start() {
        if (!isPlaying.compareAndSet(false, true)) return
        lastSetAtMs = SystemClock.uptimeMillis()
        scheduleSequentialHaptics()
    }

    open override fun playDiscrete(amplitude: Float, frequency: Float) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return
        }
        val effect = vibrationEffectsGenerator.convertToVibrationEffect(listOf(
            ControlPoint(amplitude, frequency, SEGMENT_DURATION_MS)
        ))
        effect?.let { engine.vibrate(it) }
    }

    override fun stop() {
        if (!isPlaying.compareAndSet(true, false)) return
        schedulerJob?.cancel()
        engine.stop()
    }

    override fun isActive(): Boolean = isPlaying.get()

    private fun scheduleSequentialHaptics() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return
        }
        schedulerJob?.cancel()
        schedulerJob = scope.launch {
            try {
                while (isPlaying.get() && isActive) {
                    if (SystemClock.uptimeMillis() - lastSetAtMs > KEEPALIVE_MS) {
                        // No fresh set within the keepalive window — the driver went
                        // silent; self-terminate so we never vibrate indefinitely.
                        break
                    }
                    val effect = vibrationEffectsGenerator.convertToVibrationEffect(listOf(
                        ControlPoint(currentAmplitude, currentFrequency, SEGMENT_DURATION_MS)
                    ))
                    effect?.let { engine.vibrate(it) }
                    delay(SEGMENT_DURATION_MS)
                }
            } finally {
                // If the loop exited on its own (keepalive expired) flip the flag and
                // stop the motor. When stop() drove the exit, isPlaying is already
                // false and it already called engine.stop(), so this is a no-op.
                if (isPlaying.compareAndSet(true, false)) {
                    engine.stop()
                }
            }
        }
    }
}
