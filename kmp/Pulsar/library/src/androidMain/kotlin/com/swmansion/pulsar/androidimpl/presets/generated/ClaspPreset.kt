package com.swmansion.pulsar.kmp.androidimpl.presets.generated

import com.swmansion.pulsar.kmp.androidimpl.Pulsar
import com.swmansion.pulsar.kmp.androidimpl.presets.Player
import com.swmansion.pulsar.kmp.androidimpl.types.PatternData
import com.swmansion.pulsar.kmp.androidimpl.types.Preset
import com.swmansion.pulsar.kmp.androidimpl.types.PresetWithName

class ClaspPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(5.0f, 0.65f), listOf(45.0f, 0.0f), listOf(80.0f, 0.9f), listOf(130.0f, 0.3f), listOf(220.0f, 0.0f)),
            listOf(listOf(0.0f, 0.72f), listOf(80.0f, 0.78f), listOf(220.0f, 0.75f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.65f, 0.72f),
            listOf(80.0f, 0.9f, 0.78f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Clasp"
    }
}
