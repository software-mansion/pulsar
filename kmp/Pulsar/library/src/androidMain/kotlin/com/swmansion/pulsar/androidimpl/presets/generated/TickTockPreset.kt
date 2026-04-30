package com.swmansion.pulsar.kmp.androidimpl.presets.generated

import com.swmansion.pulsar.kmp.androidimpl.Pulsar
import com.swmansion.pulsar.kmp.androidimpl.presets.Player
import com.swmansion.pulsar.kmp.androidimpl.types.PatternData
import com.swmansion.pulsar.kmp.androidimpl.types.Preset
import com.swmansion.pulsar.kmp.androidimpl.types.PresetWithName

class TickTockPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(),
            listOf(),
        ),
        rawDiscretePattern = listOf(
            listOf(1.0f, 0.8f, 0.8f),
            listOf(400.0f, 0.4f, 0.4f),
            listOf(800.0f, 0.8f, 0.8f),
            listOf(1200.0f, 0.4f, 0.4f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "TickTock"
    }
}
