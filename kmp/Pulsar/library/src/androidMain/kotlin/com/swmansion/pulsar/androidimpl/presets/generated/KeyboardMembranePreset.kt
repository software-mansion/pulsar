package com.swmansion.pulsar.kmp.androidimpl.presets.generated

import com.swmansion.pulsar.kmp.androidimpl.Pulsar
import com.swmansion.pulsar.kmp.androidimpl.presets.Player
import com.swmansion.pulsar.kmp.androidimpl.types.PatternData
import com.swmansion.pulsar.kmp.androidimpl.types.Preset
import com.swmansion.pulsar.kmp.androidimpl.types.PresetWithName

class KeyboardMembranePreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(12.0f, 0.33f), listOf(50.0f, 0.18f), listOf(100.0f, 0.06f), listOf(140.0f, 0.0f)),
            listOf(listOf(0.0f, 0.38f), listOf(140.0f, 0.35f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.35f, 0.38f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "KeyboardMembrane"
    }
}
