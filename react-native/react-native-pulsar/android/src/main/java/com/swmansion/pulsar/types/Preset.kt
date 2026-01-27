package com.swmansion.pulsar.types

interface Preset {
    fun play()
}

interface PresetWithName {
    val name: String
}