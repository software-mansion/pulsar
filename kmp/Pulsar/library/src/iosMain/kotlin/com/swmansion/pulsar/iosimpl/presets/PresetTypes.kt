package com.swmansion.pulsar.kmp.iosimpl.presets

import com.swmansion.pulsar.kmp.IOSPulsarHandle
internal interface IOSPreset {
    fun play()

    val name: String
}

internal fun interface IOSPresetFactory {
    fun getInstance(haptics: IOSPulsarHandle): IOSPreset
}
