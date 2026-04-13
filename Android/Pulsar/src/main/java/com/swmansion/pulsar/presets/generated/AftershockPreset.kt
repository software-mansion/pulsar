package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class AftershockPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(),
            listOf(),
        ),
        rawDiscretePattern = listOf(
            listOf(1.0f, 0.8f, 0.8f),
            listOf(299.0f, 0.5f, 0.247f),
            listOf(399.0f, 0.494f, 0.266f),
            listOf(500.0f, 0.497f, 0.263f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Aftershock"
    }
}
