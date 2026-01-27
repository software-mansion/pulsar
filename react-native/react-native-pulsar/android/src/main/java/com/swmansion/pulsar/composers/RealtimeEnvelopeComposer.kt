package com.swmansion.pulsar.composers

import com.swmansion.pulsar.haptics.HapticEngineWrapper
import com.swmansion.pulsar.haptics.VibrationEffectsGenerator
import com.swmansion.pulsar.types.ControlPoint
import com.swmansion.pulsar.types.RealtimeComposable
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class RealtimeEnvelopeComposer(
    private val engine: HapticEngineWrapper
) : RealtimeComposable {

    var vibrationEffectsGenerator = VibrationEffectsGenerator(engine)

    companion object {
        private const val SEGMENT_DURATION_MS = 100L
    }

    private var isPlaying = false
    private var currentAmplitude = 0.0f
    private var currentFrequency = 0.0f
    private var schedulerJob: Job? = null
    private val scope = CoroutineScope(Dispatchers.Default)

    private fun start(amplitude: Float = 0.5f, frequency: Float = 0.5f) {
        if (isPlaying) {
            stop()
        }

        isPlaying = true
        update(amplitude, frequency)
        scheduleSequentialHaptics()
    }

    override fun update(amplitude: Float, frequency: Float) {
        currentAmplitude = amplitude.coerceIn(0f, 1f)
        currentFrequency = frequency.coerceIn(0f, 1f)
        if (!isPlaying) {
            start(currentAmplitude, currentFrequency)
        }
    }

    override fun stop() {
        if (!isPlaying) return

        schedulerJob?.cancel()
        engine.stop()
        isPlaying = false
    }

    override fun isActive(): Boolean = isPlaying

    private fun scheduleSequentialHaptics() {
        schedulerJob?.cancel()
        schedulerJob = scope.launch {
            while (isPlaying) {
                val effect = vibrationEffectsGenerator.convertToVibrationEffect(listOf(
                    ControlPoint(currentAmplitude, currentFrequency, SEGMENT_DURATION_MS.toFloat())
                ))
                engine.vibrate(effect)
                delay(SEGMENT_DURATION_MS)
            }
        }
    }
}