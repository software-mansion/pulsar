package com.swmansion.pulsar.androidimpl.presets.generated

import com.swmansion.pulsar.androidimpl.Pulsar
import com.swmansion.pulsar.androidimpl.presets.Player
import com.swmansion.pulsar.androidimpl.types.PatternData
import com.swmansion.pulsar.androidimpl.types.Preset
import com.swmansion.pulsar.androidimpl.types.PresetWithName

class BloomPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(15.0f, 0.28f), listOf(80.0f, 0.15f), listOf(120.0f, 0.5f), listOf(200.0f, 0.15f), listOf(300.0f, 0.0f)),
            listOf(listOf(0.0f, 0.48f), listOf(200.0f, 0.62f), listOf(300.0f, 0.58f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.3f, 0.5f),
            listOf(120.0f, 0.55f, 0.62f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Bloom"
    }
}
