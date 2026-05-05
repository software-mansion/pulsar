package com.swmansion.pulsar.kmp.androidimpl.presets.generated

import com.swmansion.pulsar.kmp.androidimpl.Pulsar
import com.swmansion.pulsar.kmp.androidimpl.presets.Player
import com.swmansion.pulsar.kmp.androidimpl.types.PatternData
import com.swmansion.pulsar.kmp.androidimpl.types.Preset
import com.swmansion.pulsar.kmp.androidimpl.types.PresetWithName

class WanePreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(20.0f, 0.42f), listOf(180.0f, 0.22f), listOf(450.0f, 0.0f)),
            listOf(listOf(0.0f, 0.5f), listOf(180.0f, 0.4f), listOf(450.0f, 0.35f)),
        ),
        rawDiscretePattern = listOf(

        )
    )) {
    companion object: PresetWithName {
        override val name = "Wane"
    }
}
