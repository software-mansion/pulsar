package com.swmansion.pulsar.androidimpl.presets.generated

import com.swmansion.pulsar.androidimpl.Pulsar
import com.swmansion.pulsar.androidimpl.presets.Player
import com.swmansion.pulsar.androidimpl.types.PatternData
import com.swmansion.pulsar.androidimpl.types.Preset
import com.swmansion.pulsar.androidimpl.types.PresetWithName

class PipPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(5.0f, 0.32f), listOf(40.0f, 0.0f), listOf(60.0f, 0.22f), listOf(100.0f, 0.0f)),
            listOf(listOf(0.0f, 0.65f), listOf(100.0f, 0.7f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.35f, 0.65f),
            listOf(60.0f, 0.25f, 0.7f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Pip"
    }
}
