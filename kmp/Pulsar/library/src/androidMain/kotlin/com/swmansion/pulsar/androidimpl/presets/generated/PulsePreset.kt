package com.swmansion.pulsar.kmp.androidimpl.presets.generated

import com.swmansion.pulsar.kmp.androidimpl.Pulsar
import com.swmansion.pulsar.kmp.androidimpl.presets.Player
import com.swmansion.pulsar.kmp.androidimpl.types.PatternData
import com.swmansion.pulsar.kmp.androidimpl.types.Preset
import com.swmansion.pulsar.kmp.androidimpl.types.PresetWithName

class PulsePreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(300.0f, 0.3f), listOf(700.0f, 0.3f), listOf(1000.0f, 0.0f), listOf(1300.0f, 0.3f), listOf(1700.0f, 0.3f), listOf(2000.0f, 0.0f)),
            listOf(listOf(0.0f, 0.4f), listOf(2000.0f, 0.4f)),
        ),
        rawDiscretePattern = listOf(

        )
    )) {
    companion object: PresetWithName {
        override val name = "Pulse"
    }
}
