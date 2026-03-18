package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class HappinessJoyfulPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(8.0f, 0.5f), listOf(60.0f, 0.15f), listOf(120.0f, 0.6f), listOf(178.0f, 0.1f), listOf(230.0f, 0.7f), listOf(290.0f, 0.15f), listOf(330.0f, 0.75f), listOf(390.0f, 0.2f), listOf(420.0f, 0.65f), listOf(500.0f, 0.0f)),
            listOf(listOf(0.0f, 0.62f), listOf(420.0f, 0.72f), listOf(500.0f, 0.68f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.5f, 0.65f),
            listOf(120.0f, 0.6f, 0.7f),
            listOf(230.0f, 0.7f, 0.73f),
            listOf(330.0f, 0.75f, 0.75f),
            listOf(420.0f, 0.65f, 0.7f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "HappinessJoyful"
    }
}
