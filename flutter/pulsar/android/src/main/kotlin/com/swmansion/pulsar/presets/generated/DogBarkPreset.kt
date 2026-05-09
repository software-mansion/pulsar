package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class DogBarkPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(5.0f, 0.9f), listOf(50.0f, 0.65f), listOf(120.0f, 0.15f), listOf(200.0f, 0.0f), listOf(280.0f, 0.85f), listOf(325.0f, 0.6f), listOf(400.0f, 0.12f), listOf(500.0f, 0.0f)),
            listOf(listOf(0.0f, 0.2f), listOf(500.0f, 0.2f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.9f, 0.22f),
            listOf(280.0f, 0.85f, 0.22f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "DogBark"
    }
}
