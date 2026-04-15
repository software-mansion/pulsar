package com.swmansion.pulsar.androidimpl.presets.generated

import com.swmansion.pulsar.androidimpl.Pulsar
import com.swmansion.pulsar.androidimpl.presets.Player
import com.swmansion.pulsar.androidimpl.types.PatternData
import com.swmansion.pulsar.androidimpl.types.Preset
import com.swmansion.pulsar.androidimpl.types.PresetWithName

class ThrobPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(8.0f, 0.8f), listOf(80.0f, 0.0f), listOf(150.0f, 0.45f), listOf(230.0f, 0.0f)),
            listOf(listOf(0.0f, 0.65f), listOf(230.0f, 0.6f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.8f, 0.65f),
            listOf(150.0f, 0.45f, 0.6f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Throb"
    }
}
