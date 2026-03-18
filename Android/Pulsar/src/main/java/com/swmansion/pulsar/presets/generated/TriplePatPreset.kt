package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class TriplePatPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(),
            listOf(),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.591f, 0.591f),
            listOf(100.0f, 0.588f, 0.588f),
            listOf(231.0f, 0.6f, 0.328f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "TriplePat"
    }
}
