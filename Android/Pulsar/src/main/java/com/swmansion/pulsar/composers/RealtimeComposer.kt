package com.swmansion.pulsar.composers

import com.swmansion.pulsar.haptics.HapticEngineWrapper

class RealtimeComposerImpl(
    private val engine: HapticEngineWrapper
) {
    private var isPlaying = false
    private var initialized = false

    fun start(amplitude: Float = 0.5f, frequency: Float = 0.5f) {
        if (initialized && isPlaying) {
            stop()
        }
        isPlaying = true
        initialized = true
        update(amplitude = amplitude, frequency = frequency)
    }

    fun update(amplitude: Float, frequency: Float) {
        if (!isPlaying) {
            start(amplitude = amplitude, frequency = frequency)
        }

        val clampedIntensity = amplitude.coerceIn(0f, 1f)
        val clampedSharpness = frequency.coerceIn(0f, 1f)

        val durationMs = 50L
        val amplitudeInt = (clampedIntensity * 255).toInt()

//        engine.vibrate(duration = durationMs, amplitude = amplitudeInt)
    }

    fun stop() {
        if (!isPlaying) return

//        engine.stop()
        isPlaying = false
    }

    fun isActive(): Boolean = isPlaying
}
