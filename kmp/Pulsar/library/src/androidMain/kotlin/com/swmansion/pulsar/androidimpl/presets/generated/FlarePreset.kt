package com.swmansion.pulsar.kmp.androidimpl.presets.generated

import com.swmansion.pulsar.kmp.androidimpl.Pulsar
import com.swmansion.pulsar.kmp.androidimpl.presets.Player
import com.swmansion.pulsar.kmp.androidimpl.types.PatternData
import com.swmansion.pulsar.kmp.androidimpl.types.Preset
import com.swmansion.pulsar.kmp.androidimpl.types.PresetWithName

class FlarePreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(20.0f, 0.18f), listOf(60.0f, 0.52f), listOf(90.0f, 0.95f), listOf(100.0f, 1.0f), listOf(120.0f, 0.75f), listOf(140.0f, 0.65f), listOf(200.0f, 0.35f), listOf(380.0f, 0.0f)),
            listOf(listOf(0.0f, 0.7f), listOf(60.0f, 0.82f), listOf(100.0f, 0.92f), listOf(200.0f, 0.75f), listOf(380.0f, 0.6f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.2f, 0.7f),
            listOf(60.0f, 0.55f, 0.8f),
            listOf(100.0f, 1.0f, 0.9f),
            listOf(140.0f, 0.7f, 0.85f),
            listOf(200.0f, 0.4f, 0.75f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Flare"
    }
}
