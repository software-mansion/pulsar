package com.swmansion.pulsar.kmp.androidimpl.presets.generated

import com.swmansion.pulsar.kmp.androidimpl.Pulsar
import com.swmansion.pulsar.kmp.androidimpl.presets.Player
import com.swmansion.pulsar.kmp.androidimpl.types.PatternData
import com.swmansion.pulsar.kmp.androidimpl.types.Preset
import com.swmansion.pulsar.kmp.androidimpl.types.PresetWithName

class ExplosionPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(5.0f, 1.0f), listOf(80.0f, 0.7f), listOf(200.0f, 0.5f), listOf(400.0f, 0.3f), listOf(700.0f, 0.1f), listOf(1000.0f, 0.0f)),
            listOf(listOf(0.0f, 0.2f), listOf(5.0f, 0.15f), listOf(1000.0f, 0.05f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 1.0f, 0.4f),
            listOf(50.0f, 0.8f, 0.328f),
            listOf(120.0f, 0.722f, 0.256f),
            listOf(187.0f, 0.594f, 0.138f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Explosion"
    }
}
