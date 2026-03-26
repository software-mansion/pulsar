package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class StampPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(8.0f, 0.55f), listOf(55.0f, 0.0f), listOf(150.0f, 0.55f), listOf(205.0f, 0.0f)),
            listOf(listOf(0.0f, 0.5f), listOf(205.0f, 0.5f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.55f, 0.5f),
            listOf(150.0f, 0.55f, 0.5f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Stamp"
    }
}
