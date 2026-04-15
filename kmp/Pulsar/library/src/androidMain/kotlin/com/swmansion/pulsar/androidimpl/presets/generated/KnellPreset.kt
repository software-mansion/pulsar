package com.swmansion.pulsar.androidimpl.presets.generated

import com.swmansion.pulsar.androidimpl.Pulsar
import com.swmansion.pulsar.androidimpl.presets.Player
import com.swmansion.pulsar.androidimpl.types.PatternData
import com.swmansion.pulsar.androidimpl.types.Preset
import com.swmansion.pulsar.androidimpl.types.PresetWithName

class KnellPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(8.0f, 0.9f), listOf(200.0f, 0.5f), listOf(300.0f, 0.1f), listOf(350.0f, 0.5f), listOf(430.0f, 0.1f), listOf(550.0f, 0.0f)),
            listOf(listOf(0.0f, 0.58f), listOf(300.0f, 0.52f), listOf(550.0f, 0.48f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.9f, 0.58f),
            listOf(350.0f, 0.5f, 0.5f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Knell"
    }
}
