package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class ExhalePreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(10.0f, 0.6f), listOf(100.0f, 0.4f), listOf(200.0f, 0.25f), listOf(500.0f, 0.2f), listOf(800.0f, 0.15f), listOf(1200.0f, 0.0f)),
            listOf(listOf(0.0f, 0.6f), listOf(200.0f, 0.28f), listOf(1200.0f, 0.15f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.6f, 0.6f),
            listOf(150.0f, 0.35f, 0.3f),
            listOf(500.0f, 0.2f, 0.15f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Exhale"
    }
}
