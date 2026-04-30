package com.swmansion.pulsar.kmp.androidimpl.presets.generated

import com.swmansion.pulsar.kmp.androidimpl.Pulsar
import com.swmansion.pulsar.kmp.androidimpl.presets.Player
import com.swmansion.pulsar.kmp.androidimpl.types.PatternData
import com.swmansion.pulsar.kmp.androidimpl.types.Preset
import com.swmansion.pulsar.kmp.androidimpl.types.PresetWithName

class VortexPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.05f), listOf(200.0f, 0.08f), listOf(400.0f, 0.13f), listOf(600.0f, 0.22f), listOf(800.0f, 0.35f), listOf(950.0f, 0.52f), listOf(1050.0f, 0.72f), listOf(1150.0f, 0.9f), listOf(1195.0f, 0.0f), listOf(1200.0f, 1.0f), listOf(1250.0f, 0.3f), listOf(1400.0f, 0.0f)),
            listOf(listOf(0.0f, 0.25f), listOf(600.0f, 0.4f), listOf(1000.0f, 0.62f), listOf(1150.0f, 0.82f), listOf(1200.0f, 0.9f), listOf(1400.0f, 0.5f)),
        ),
        rawDiscretePattern = listOf(
            listOf(1200.0f, 1.0f, 0.8f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Vortex"
    }
}
