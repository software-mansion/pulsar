package com.swmansion.pulsar.kmp.androidimpl.presets.generated

import com.swmansion.pulsar.kmp.androidimpl.Pulsar
import com.swmansion.pulsar.kmp.androidimpl.presets.Player
import com.swmansion.pulsar.kmp.androidimpl.types.PatternData
import com.swmansion.pulsar.kmp.androidimpl.types.Preset
import com.swmansion.pulsar.kmp.androidimpl.types.PresetWithName

class LighthousePreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(15.0f, 0.4f), listOf(150.0f, 0.4f), listOf(250.0f, 0.0f), listOf(400.0f, 0.0f), listOf(415.0f, 0.4f), listOf(550.0f, 0.4f), listOf(650.0f, 0.0f), listOf(800.0f, 0.0f), listOf(815.0f, 0.4f), listOf(950.0f, 0.4f), listOf(1050.0f, 0.0f)),
            listOf(listOf(0.0f, 0.5f), listOf(1050.0f, 0.5f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.45f, 0.5f),
            listOf(400.0f, 0.45f, 0.5f),
            listOf(800.0f, 0.45f, 0.5f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Lighthouse"
    }
}
