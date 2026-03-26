package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class PoundPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(8.0f, 0.95f), listOf(65.0f, 0.0f), listOf(100.0f, 0.95f), listOf(165.0f, 0.0f), listOf(200.0f, 0.95f), listOf(265.0f, 0.0f)),
            listOf(listOf(0.0f, 0.72f), listOf(265.0f, 0.72f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.95f, 0.7f),
            listOf(100.0f, 0.95f, 0.7f),
            listOf(200.0f, 0.95f, 0.7f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Pound"
    }
}
