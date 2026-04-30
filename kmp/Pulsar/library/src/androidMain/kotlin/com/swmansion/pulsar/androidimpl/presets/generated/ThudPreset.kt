package com.swmansion.pulsar.kmp.androidimpl.presets.generated

import com.swmansion.pulsar.kmp.androidimpl.Pulsar
import com.swmansion.pulsar.kmp.androidimpl.presets.Player
import com.swmansion.pulsar.kmp.androidimpl.types.PatternData
import com.swmansion.pulsar.kmp.androidimpl.types.Preset
import com.swmansion.pulsar.kmp.androidimpl.types.PresetWithName

class ThudPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(15.0f, 0.45f), listOf(80.0f, 0.35f), listOf(160.0f, 0.0f)),
            listOf(listOf(0.0f, 0.42f), listOf(160.0f, 0.4f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.5f, 0.42f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Thud"
    }
}
