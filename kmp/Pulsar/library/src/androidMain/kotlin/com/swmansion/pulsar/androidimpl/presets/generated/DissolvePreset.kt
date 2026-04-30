package com.swmansion.pulsar.kmp.androidimpl.presets.generated

import com.swmansion.pulsar.kmp.androidimpl.Pulsar
import com.swmansion.pulsar.kmp.androidimpl.presets.Player
import com.swmansion.pulsar.kmp.androidimpl.types.PatternData
import com.swmansion.pulsar.kmp.androidimpl.types.Preset
import com.swmansion.pulsar.kmp.androidimpl.types.PresetWithName

class DissolvePreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(50.0f, 0.38f), listOf(300.0f, 0.28f), listOf(600.0f, 0.2f), listOf(900.0f, 0.12f), listOf(1200.0f, 0.0f)),
            listOf(listOf(0.0f, 0.38f), listOf(1200.0f, 0.18f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.4f, 0.4f),
            listOf(400.0f, 0.25f, 0.2f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Dissolve"
    }
}
