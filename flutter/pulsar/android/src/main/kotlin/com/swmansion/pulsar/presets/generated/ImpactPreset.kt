package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class ImpactPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(5.0f, 0.85f), listOf(60.0f, 0.35f), listOf(120.0f, 0.15f), listOf(200.0f, 0.0f)),
            listOf(listOf(0.0f, 0.6f), listOf(200.0f, 0.35f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.9f, 0.6f),
            listOf(80.0f, 0.5f, 0.5f),
            listOf(150.0f, 0.25f, 0.4f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Impact"
    }
}
