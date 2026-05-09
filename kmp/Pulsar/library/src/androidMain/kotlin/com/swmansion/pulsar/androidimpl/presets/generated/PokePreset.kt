package com.swmansion.pulsar.kmp.androidimpl.presets.generated

import com.swmansion.pulsar.kmp.androidimpl.Pulsar
import com.swmansion.pulsar.kmp.androidimpl.presets.Player
import com.swmansion.pulsar.kmp.androidimpl.types.PatternData
import com.swmansion.pulsar.kmp.androidimpl.types.Preset
import com.swmansion.pulsar.kmp.androidimpl.types.PresetWithName

class PokePreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(8.0f, 0.6f), listOf(62.0f, 0.0f), listOf(100.0f, 0.6f), listOf(162.0f, 0.0f), listOf(200.0f, 0.7f), listOf(280.0f, 0.0f)),
            listOf(listOf(0.0f, 0.6f), listOf(200.0f, 0.65f), listOf(280.0f, 0.63f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.6f, 0.6f),
            listOf(100.0f, 0.6f, 0.6f),
            listOf(200.0f, 0.7f, 0.65f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Poke"
    }
}
