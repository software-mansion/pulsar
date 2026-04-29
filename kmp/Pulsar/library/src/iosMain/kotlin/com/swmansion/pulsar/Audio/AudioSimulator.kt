package com.swmansion.pulsar

internal class IOSAudioSimulator {
    private var playSound = false

    fun parsePattern(data: PatternData): IOSAudioBuffer? {
        return if (playSound) IOSAudioBuffer(data) else null
    }

    fun enableSound(value: Boolean) {
        playSound = value
    }

    fun play(buffer: IOSAudioBuffer?) = Unit

    fun stop() = Unit
}

internal data class IOSAudioBuffer(
    val data: PatternData,
)
