package com.swmansion.pulsar.kmp.androidimpl.presets.generated

import com.swmansion.pulsar.kmp.androidimpl.Pulsar
import com.swmansion.pulsar.kmp.androidimpl.presets.Player
import com.swmansion.pulsar.kmp.androidimpl.types.PatternData
import com.swmansion.pulsar.kmp.androidimpl.types.Preset
import com.swmansion.pulsar.kmp.androidimpl.types.PresetWithName

class PealPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(8.0f, 0.75f), listOf(80.0f, 0.0f), listOf(180.0f, 0.75f), listOf(258.0f, 0.0f), listOf(360.0f, 0.75f), listOf(438.0f, 0.0f)),
            listOf(listOf(0.0f, 0.62f), listOf(438.0f, 0.62f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.75f, 0.62f),
            listOf(180.0f, 0.75f, 0.62f),
            listOf(360.0f, 0.75f, 0.62f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Peal"
    }
}
