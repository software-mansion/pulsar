package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class ExplosionPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(5.0f, 1.0f), listOf(80.0f, 0.7f), listOf(200.0f, 0.5f), listOf(400.0f, 0.3f), listOf(700.0f, 0.1f), listOf(1000.0f, 0.0f)),
            listOf(listOf(0.0f, 0.2f), listOf(5.0f, 0.15f), listOf(1000.0f, 0.05f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 1.0f, 0.3f),
            listOf(50.0f, 0.8f, 0.25f),
            listOf(120.0f, 0.5f, 0.2f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Explosion"
    }
}
