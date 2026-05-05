package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class StoneSkipPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(),
            listOf(),
        ),
        rawDiscretePattern = listOf(
            listOf(1.0f, 0.706f, 0.706f),
            listOf(77.0f, 0.697f, 0.5f),
            listOf(181.0f, 0.703f, 0.244f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "StoneSkip"
    }
}
