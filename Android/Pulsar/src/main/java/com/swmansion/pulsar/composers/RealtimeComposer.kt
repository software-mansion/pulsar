package com.swmansion.pulsar.composers

import com.swmansion.pulsar.haptics.HapticEngineWrapper

class RealtimeComposer(
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

    }

    fun update(amplitude: Float, frequency: Float) {
        if (!isPlaying) {
            start(amplitude = amplitude, frequency = frequency)
        }

    }

    fun stop() {
        if (!isPlaying) return

//        engine.stop()
        isPlaying = false
    }

    fun isActive(): Boolean = isPlaying
}
