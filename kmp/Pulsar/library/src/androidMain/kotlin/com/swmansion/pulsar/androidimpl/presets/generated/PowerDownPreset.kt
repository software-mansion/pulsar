package com.swmansion.pulsar.kmp.androidimpl.presets.generated

import com.swmansion.pulsar.kmp.androidimpl.Pulsar
import com.swmansion.pulsar.kmp.androidimpl.presets.Player
import com.swmansion.pulsar.kmp.androidimpl.types.PatternData
import com.swmansion.pulsar.kmp.androidimpl.types.Preset
import com.swmansion.pulsar.kmp.androidimpl.types.PresetWithName

class PowerDownPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.8f), listOf(200.0f, 0.7f), listOf(450.0f, 0.55f), listOf(750.0f, 0.4f), listOf(1050.0f, 0.25f), listOf(1350.0f, 0.12f), listOf(1600.0f, 0.03f), listOf(1800.0f, 0.0f)),
            listOf(listOf(0.0f, 0.6f), listOf(1800.0f, 0.03f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.8f, 0.6f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "PowerDown"
    }
}
