package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class AfterglowPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(),
            listOf(),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 1.0f, 0.3f),
            listOf(75.0f, 0.703f, 0.203f),
            listOf(150.0f, 0.5f, 0.1f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Afterglow"
    }
}
