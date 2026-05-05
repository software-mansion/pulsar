package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class FlinchPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(4.0f, 0.95f), listOf(60.0f, 0.3f), listOf(120.0f, 0.8f), listOf(170.0f, 0.4f), listOf(280.0f, 0.0f)),
            listOf(listOf(0.0f, 0.73f), listOf(120.0f, 0.68f), listOf(280.0f, 0.55f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.9f, 0.75f),
            listOf(120.0f, 0.75f, 0.7f),
            listOf(200.0f, 0.4f, 0.58f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Flinch"
    }
}
