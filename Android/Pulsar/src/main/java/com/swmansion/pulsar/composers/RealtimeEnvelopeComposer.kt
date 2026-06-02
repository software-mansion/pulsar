package com.swmansion.pulsar.composers

import android.os.Build
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
    }

    private val isPlaying = AtomicBoolean(false)
    /**
     * Sticky "stopped" latch. Once set by [stop], subsequent [set]/[playDiscrete]
     * calls are no-ops until [reset] clears it. This is load-bearing: the previous
     * design auto-restarted the scheduler whenever [set] observed isPlaying==false,
     * so a single stray UI-runtime [set] arriving after the JS teardown was enough
     * to resurrect playback with no remaining caller to stop it.
     */
    private val isStopped = AtomicBoolean(false)
    @Volatile private var currentAmplitude = 0.0f
    @Volatile private var currentFrequency = 0.0f
    @Volatile private var schedulerJob: Job? = null
    private val scope = CoroutineScope(Dispatchers.Default)

    private fun start() {
        isPlaying.set(true)
        scheduleSequentialHaptics()
    }

    override fun set(amplitude: Float, frequency: Float) {
        if (isStopped.get()) return
        currentAmplitude = amplitude.coerceIn(0f, 1f)
        currentFrequency = frequency.coerceIn(0f, 1f)
        if (!isPlaying.get()) {
            start()
        }
    }

    open override fun playDiscrete(amplitude: Float, frequency: Float) {
        if (isStopped.get()) return
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return
        }
        val effect = vibrationEffectsGenerator.convertToVibrationEffect(listOf(
            ControlPoint(amplitude, frequency, SEGMENT_DURATION_MS)
        ))
        effect?.let { engine.vibrate(it) }
    }

    override fun stop() {
        // Latch first, unconditionally, so a stop-while-idle still blocks future
        // auto-starts. Then cancel any in-flight scheduler regardless of whether
        // we were the thread that flipped isPlaying — concurrent set/stop races
        // could otherwise leak a scheduler job that nothing cancels.
        isStopped.set(true)
        isPlaying.set(false)
        schedulerJob?.cancel()
        schedulerJob = null
        engine.stop()
    }

    override fun isActive(): Boolean = isPlaying.get()

    override fun reset() {
        isStopped.set(false)
    }

    /**
     * Visible to subclasses so they can honor the stopped-latch in their own
     * overrides of [playDiscrete] etc. without re-implementing the AtomicBoolean.
     */
    protected fun isComposerStopped(): Boolean = isStopped.get()

    private fun scheduleSequentialHaptics() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return
        }
        schedulerJob?.cancel()
        schedulerJob = scope.launch {
            try {
                while (isPlaying.get() && !isStopped.get() && isActive) {
                    val effect = vibrationEffectsGenerator.convertToVibrationEffect(listOf(
                        ControlPoint(currentAmplitude, currentFrequency, SEGMENT_DURATION_MS)
                    ))
                    // Re-check both flags right before vibrate to suppress the
                    // cooperative-cancellation tail: stop() may have flipped them
                    // after the while-predicate but before this line.
                    if (!isPlaying.get() || isStopped.get()) break
                    effect?.let { engine.vibrate(it) }
                    delay(SEGMENT_DURATION_MS)
                }
            } finally {
                if (!isPlaying.get() || isStopped.get()) {
                    engine.stop()
                }
            }
        }
    }
}
