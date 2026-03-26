package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class BuzzPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(5.0f, 0.9f), listOf(100.0f, 0.85f), listOf(150.0f, 0.65f), listOf(250.0f, 0.3f), listOf(350.0f, 0.0f)),
            listOf(listOf(0.0f, 0.85f), listOf(350.0f, 0.8f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.9f, 0.85f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Buzz"
    }
}
