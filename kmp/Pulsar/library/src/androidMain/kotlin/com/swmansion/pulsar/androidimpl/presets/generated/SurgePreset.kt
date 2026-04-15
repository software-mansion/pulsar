package com.swmansion.pulsar.androidimpl.presets.generated

import com.swmansion.pulsar.androidimpl.Pulsar
import com.swmansion.pulsar.androidimpl.presets.Player
import com.swmansion.pulsar.androidimpl.types.PatternData
import com.swmansion.pulsar.androidimpl.types.Preset
import com.swmansion.pulsar.androidimpl.types.PresetWithName

class SurgePreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(8.0f, 0.45f), listOf(60.0f, 0.1f), listOf(75.0f, 0.58f), listOf(130.0f, 0.12f), listOf(145.0f, 0.7f), listOf(195.0f, 0.15f), listOf(210.0f, 0.8f), listOf(330.0f, 0.0f)),
            listOf(listOf(0.0f, 0.82f), listOf(210.0f, 0.93f), listOf(330.0f, 0.9f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.5f, 0.82f),
            listOf(75.0f, 0.62f, 0.86f),
            listOf(145.0f, 0.74f, 0.9f),
            listOf(210.0f, 0.8f, 0.92f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Surge"
    }
}
