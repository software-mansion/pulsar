package com.swmansion.pulsar.androidimpl.presets.generated

import com.swmansion.pulsar.androidimpl.Pulsar
import com.swmansion.pulsar.androidimpl.presets.Player
import com.swmansion.pulsar.androidimpl.types.PatternData
import com.swmansion.pulsar.androidimpl.types.Preset
import com.swmansion.pulsar.androidimpl.types.PresetWithName

class RapPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(),
            listOf(),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.6f, 0.5f),
            listOf(120.0f, 0.4f, 0.5f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Rap"
    }
}
