package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class BtnSecondaryPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(6.0f, 0.48f), listOf(50.0f, 0.15f), listOf(90.0f, 0.0f)),
            listOf(listOf(0.0f, 0.52f), listOf(90.0f, 0.5f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.5f, 0.52f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "BtnSecondary"
    }
}
