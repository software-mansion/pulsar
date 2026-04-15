package com.swmansion.pulsar.androidimpl.presets.generated

import com.swmansion.pulsar.androidimpl.Pulsar
import com.swmansion.pulsar.androidimpl.presets.Player
import com.swmansion.pulsar.androidimpl.types.PatternData
import com.swmansion.pulsar.androidimpl.types.Preset
import com.swmansion.pulsar.androidimpl.types.PresetWithName

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
