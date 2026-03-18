package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class WarningSoftPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(10.0f, 0.5f), listOf(100.0f, 0.35f), listOf(200.0f, 0.0f)),
            listOf(listOf(0.0f, 0.6f), listOf(200.0f, 0.58f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.55f, 0.6f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "WarningSoft"
    }
}
