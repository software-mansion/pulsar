package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class BtnIconPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(4.0f, 0.55f), listOf(28.0f, 0.0f)),
            listOf(listOf(0.0f, 0.58f), listOf(28.0f, 0.56f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.55f, 0.58f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "BtnIcon"
    }
}
