package com.swmansion.pulsar.kmp.androidimpl.presets.generated

import com.swmansion.pulsar.kmp.androidimpl.Pulsar
import com.swmansion.pulsar.kmp.androidimpl.presets.Player
import com.swmansion.pulsar.kmp.androidimpl.types.PatternData
import com.swmansion.pulsar.kmp.androidimpl.types.Preset
import com.swmansion.pulsar.kmp.androidimpl.types.PresetWithName

class SweepPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(8.0f, 0.4f), listOf(120.0f, 0.05f), listOf(400.0f, 0.02f), listOf(590.0f, 0.0f), listOf(600.0f, 0.4f), listOf(720.0f, 0.05f), listOf(1000.0f, 0.02f), listOf(1190.0f, 0.0f), listOf(1200.0f, 0.4f), listOf(1320.0f, 0.05f), listOf(1600.0f, 0.02f), listOf(1790.0f, 0.0f), listOf(1800.0f, 0.4f), listOf(1920.0f, 0.05f), listOf(2100.0f, 0.0f)),
            listOf(listOf(0.0f, 0.72f), listOf(2100.0f, 0.72f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.4f, 0.7f),
            listOf(600.0f, 0.4f, 0.7f),
            listOf(1200.0f, 0.4f, 0.7f),
            listOf(1800.0f, 0.4f, 0.7f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Sweep"
    }
}
