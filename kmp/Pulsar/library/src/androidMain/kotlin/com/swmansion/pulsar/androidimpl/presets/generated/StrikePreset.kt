package com.swmansion.pulsar.kmp.androidimpl.presets.generated

import com.swmansion.pulsar.kmp.androidimpl.Pulsar
import com.swmansion.pulsar.kmp.androidimpl.presets.Player
import com.swmansion.pulsar.kmp.androidimpl.types.PatternData
import com.swmansion.pulsar.kmp.androidimpl.types.Preset
import com.swmansion.pulsar.kmp.androidimpl.types.PresetWithName

class StrikePreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(5.0f, 0.72f), listOf(40.0f, 0.2f), listOf(80.0f, 0.0f)),
            listOf(listOf(0.0f, 0.62f), listOf(80.0f, 0.6f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.75f, 0.62f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Strike"
    }
}
