package com.swmansion.pulsar.kmp.androidimpl.presets.generated

import com.swmansion.pulsar.kmp.androidimpl.Pulsar
import com.swmansion.pulsar.kmp.androidimpl.presets.Player
import com.swmansion.pulsar.kmp.androidimpl.types.PatternData
import com.swmansion.pulsar.kmp.androidimpl.types.Preset
import com.swmansion.pulsar.kmp.androidimpl.types.PresetWithName

class PummelPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(4.0f, 0.9f), listOf(45.0f, 0.6f), listOf(70.0f, 0.78f), listOf(100.0f, 0.55f), listOf(130.0f, 0.92f), listOf(165.0f, 0.65f), listOf(190.0f, 0.82f), listOf(230.0f, 0.7f), listOf(250.0f, 1.0f), listOf(320.0f, 0.4f), listOf(450.0f, 0.0f)),
            listOf(listOf(0.0f, 0.85f), listOf(450.0f, 0.82f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.9f, 0.85f),
            listOf(70.0f, 0.75f, 0.82f),
            listOf(130.0f, 0.95f, 0.87f),
            listOf(190.0f, 0.8f, 0.83f),
            listOf(250.0f, 1.0f, 0.88f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Pummel"
    }
}
