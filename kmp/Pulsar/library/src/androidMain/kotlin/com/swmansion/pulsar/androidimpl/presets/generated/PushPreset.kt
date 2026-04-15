package com.swmansion.pulsar.androidimpl.presets.generated

import com.swmansion.pulsar.androidimpl.Pulsar
import com.swmansion.pulsar.androidimpl.presets.Player
import com.swmansion.pulsar.androidimpl.types.PatternData
import com.swmansion.pulsar.androidimpl.types.Preset
import com.swmansion.pulsar.androidimpl.types.PresetWithName

class PushPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(6.0f, 0.48f), listOf(50.0f, 0.15f), listOf(90.0f, 0.0f)),
            listOf(listOf(0.0f, 0.52f), listOf(90.0f, 0.5f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.5f, 0.52f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Push"
    }
}
