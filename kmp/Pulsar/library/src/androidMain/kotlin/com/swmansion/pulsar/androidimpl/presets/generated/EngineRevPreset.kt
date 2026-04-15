package com.swmansion.pulsar.androidimpl.presets.generated

import com.swmansion.pulsar.androidimpl.Pulsar
import com.swmansion.pulsar.androidimpl.presets.Player
import com.swmansion.pulsar.androidimpl.types.PatternData
import com.swmansion.pulsar.androidimpl.types.Preset
import com.swmansion.pulsar.androidimpl.types.PresetWithName

class EngineRevPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.15f), listOf(700.0f, 0.75f), listOf(710.0f, 0.2f), listOf(720.0f, 0.25f), listOf(1400.0f, 0.95f), listOf(1600.0f, 0.5f), listOf(1800.0f, 0.0f)),
            listOf(listOf(0.0f, 0.08f), listOf(700.0f, 0.45f), listOf(720.0f, 0.12f), listOf(1400.0f, 0.55f), listOf(1800.0f, 0.3f)),
        ),
        rawDiscretePattern = listOf(
            listOf(700.0f, 0.8f, 0.4f),
            listOf(1400.0f, 1.0f, 0.5f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "EngineRev"
    }
}
