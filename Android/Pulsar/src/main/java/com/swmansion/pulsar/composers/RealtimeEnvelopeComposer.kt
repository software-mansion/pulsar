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
    @Volatile private var currentAmplitude = 0.0f
    @Volatile private var currentFrequency = 0.0f
    private var schedulerJob: Job? = null
    private val scope = CoroutineScope(Dispatchers.Default)

    private fun start() {
        isPlaying.set(true)
        scheduleSequentialHaptics()
    }

    override fun set(amplitude: Float, frequency: Float) {
        currentAmplitude = amplitude.coerceIn(0f, 1f)
        currentFrequency = frequency.coerceIn(0f, 1f)
        if (!isPlaying.get()) {
            start()
        }
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
                    val effect = vibrationEffectsGenerator.convertToVibrationEffect(listOf(
                        ControlPoint(currentAmplitude, currentFrequency, SEGMENT_DURATION_MS)
                    ))
                    effect?.let { engine.vibrate(it) }
                    delay(SEGMENT_DURATION_MS)
                }
            } finally {
                if (!isPlaying.get()) {
                    engine.stop()
                }
            }
        }
    }
}
