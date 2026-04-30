package com.swmansion.pulsar.kmp.androidimpl.presets.generated

import com.swmansion.pulsar.kmp.androidimpl.Pulsar
import com.swmansion.pulsar.kmp.androidimpl.presets.Player
import com.swmansion.pulsar.kmp.androidimpl.types.PatternData
import com.swmansion.pulsar.kmp.androidimpl.types.Preset
import com.swmansion.pulsar.kmp.androidimpl.types.PresetWithName

class LiltPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(8.0f, 0.45f), listOf(72.0f, 0.0f), listOf(160.0f, 0.65f), listOf(240.0f, 0.12f), listOf(360.0f, 0.0f)),
            listOf(listOf(0.0f, 0.5f), listOf(160.0f, 0.65f), listOf(360.0f, 0.6f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.45f, 0.52f),
            listOf(160.0f, 0.65f, 0.65f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Lilt"
    }
}
