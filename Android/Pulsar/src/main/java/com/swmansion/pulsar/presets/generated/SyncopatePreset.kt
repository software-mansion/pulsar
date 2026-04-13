package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class SyncopatePreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(),
            listOf(),
        ),
        rawDiscretePattern = listOf(
            listOf(10.0f, 1.0f, 0.903f),
            listOf(201.0f, 1.0f, 0.513f),
            listOf(399.0f, 0.997f, 0.906f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Syncopate"
    }
}
