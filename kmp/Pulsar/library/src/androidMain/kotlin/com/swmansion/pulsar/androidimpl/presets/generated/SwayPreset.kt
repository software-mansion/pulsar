package com.swmansion.pulsar.kmp.androidimpl.presets.generated

import com.swmansion.pulsar.kmp.androidimpl.Pulsar
import com.swmansion.pulsar.kmp.androidimpl.presets.Player
import com.swmansion.pulsar.kmp.androidimpl.types.PatternData
import com.swmansion.pulsar.kmp.androidimpl.types.Preset
import com.swmansion.pulsar.kmp.androidimpl.types.PresetWithName

class SwayPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(20.0f, 0.45f), listOf(250.0f, 0.35f), listOf(500.0f, 0.0f), listOf(700.0f, 0.0f), listOf(720.0f, 0.45f), listOf(950.0f, 0.35f), listOf(1200.0f, 0.0f), listOf(1400.0f, 0.0f), listOf(1420.0f, 0.45f), listOf(1650.0f, 0.35f), listOf(1900.0f, 0.0f)),
            listOf(listOf(0.0f, 0.22f), listOf(1900.0f, 0.22f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.5f, 0.25f),
            listOf(700.0f, 0.5f, 0.25f),
            listOf(1400.0f, 0.5f, 0.25f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Sway"
    }
}
