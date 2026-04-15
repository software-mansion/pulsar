package com.swmansion.pulsar.androidimpl.presets.generated

import com.swmansion.pulsar.androidimpl.Pulsar
import com.swmansion.pulsar.androidimpl.presets.Player
import com.swmansion.pulsar.androidimpl.types.PatternData
import com.swmansion.pulsar.androidimpl.types.Preset
import com.swmansion.pulsar.androidimpl.types.PresetWithName

class FlickPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(6.0f, 0.4f), listOf(45.0f, 0.05f), listOf(80.0f, 0.0f)),
            listOf(listOf(0.0f, 0.5f), listOf(80.0f, 0.5f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.42f, 0.5f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Flick"
    }
}
