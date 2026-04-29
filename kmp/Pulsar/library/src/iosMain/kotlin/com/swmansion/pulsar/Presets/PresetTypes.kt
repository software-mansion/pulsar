package com.swmansion.pulsar

internal interface IOSPreset {
    fun play()

    val name: String
}

internal fun interface IOSPresetFactory {
    fun getInstance(haptics: IOSPulsarHandle): IOSPreset
}
