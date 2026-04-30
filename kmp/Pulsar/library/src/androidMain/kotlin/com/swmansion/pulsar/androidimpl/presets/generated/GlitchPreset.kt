package com.swmansion.pulsar.kmp.androidimpl.presets.generated

import com.swmansion.pulsar.kmp.androidimpl.Pulsar
import com.swmansion.pulsar.kmp.androidimpl.presets.Player
import com.swmansion.pulsar.kmp.androidimpl.types.PatternData
import com.swmansion.pulsar.kmp.androidimpl.types.Preset
import com.swmansion.pulsar.kmp.androidimpl.types.PresetWithName

class GlitchPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.9f), listOf(20.0f, 0.1f), listOf(55.0f, 1.0f), listOf(65.0f, 0.0f), listOf(100.0f, 0.85f), listOf(118.0f, 0.0f), listOf(160.0f, 0.95f), listOf(175.0f, 0.15f), listOf(220.0f, 0.0f)),
            listOf(listOf(0.0f, 0.9f), listOf(20.0f, 0.2f), listOf(55.0f, 1.0f), listOf(65.0f, 0.1f), listOf(100.0f, 0.88f), listOf(118.0f, 0.15f), listOf(160.0f, 0.92f), listOf(220.0f, 0.3f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.9f, 0.9f),
            listOf(30.0f, 0.2f, 0.3f),
            listOf(55.0f, 1.0f, 0.95f),
            listOf(70.0f, 0.1f, 0.2f),
            listOf(100.0f, 0.85f, 0.85f),
            listOf(130.0f, 0.05f, 0.1f),
            listOf(160.0f, 0.95f, 0.9f),
            listOf(185.0f, 0.3f, 0.4f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Glitch"
    }
}
