package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class HeavyImpactPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(5.0f, 1.0f), listOf(60.0f, 0.6f), listOf(150.0f, 0.3f), listOf(300.0f, 0.1f), listOf(500.0f, 0.0f)),
            listOf(listOf(0.0f, 0.12f), listOf(5.0f, 0.1f), listOf(500.0f, 0.08f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 1.0f, 0.15f),
            listOf(80.0f, 0.5f, 0.2f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "HeavyImpact"
    }
}
