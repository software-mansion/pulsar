package com.swmansion.pulsar.kmp.androidimpl.presets.generated

import com.swmansion.pulsar.kmp.androidimpl.Pulsar
import com.swmansion.pulsar.kmp.androidimpl.presets.Player
import com.swmansion.pulsar.kmp.androidimpl.types.PatternData
import com.swmansion.pulsar.kmp.androidimpl.types.Preset
import com.swmansion.pulsar.kmp.androidimpl.types.PresetWithName

class HailPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(10.0f, 0.3f), listOf(400.0f, 0.3f), listOf(430.0f, 0.0f)),
            listOf(listOf(0.0f, 0.7f), listOf(430.0f, 0.7f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.6f, 0.7f),
            listOf(40.0f, 0.8f, 0.75f),
            listOf(75.0f, 0.4f, 0.65f),
            listOf(100.0f, 0.9f, 0.8f),
            listOf(130.0f, 0.5f, 0.7f),
            listOf(165.0f, 0.7f, 0.75f),
            listOf(190.0f, 1.0f, 0.85f),
            listOf(225.0f, 0.45f, 0.65f),
            listOf(255.0f, 0.8f, 0.78f),
            listOf(285.0f, 0.6f, 0.7f),
            listOf(310.0f, 0.9f, 0.82f),
            listOf(345.0f, 0.5f, 0.68f),
            listOf(370.0f, 0.7f, 0.74f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Hail"
    }
}
