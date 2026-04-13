package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class RainPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(50.0f, 0.08f), listOf(200.0f, 0.05f), listOf(400.0f, 0.08f), listOf(600.0f, 0.05f), listOf(850.0f, 0.08f), listOf(950.0f, 0.0f)),
            listOf(listOf(0.0f, 0.6f), listOf(950.0f, 0.6f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.2f, 0.6f),
            listOf(80.0f, 0.15f, 0.5f),
            listOf(150.0f, 0.3f, 0.7f),
            listOf(210.0f, 0.1f, 0.5f),
            listOf(310.0f, 0.25f, 0.6f),
            listOf(380.0f, 0.2f, 0.55f),
            listOf(460.0f, 0.35f, 0.65f),
            listOf(520.0f, 0.1f, 0.5f),
            listOf(610.0f, 0.2f, 0.6f),
            listOf(700.0f, 0.15f, 0.55f),
            listOf(760.0f, 0.3f, 0.7f),
            listOf(850.0f, 0.2f, 0.6f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Rain"
    }
}
