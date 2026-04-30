package com.swmansion.pulsar.kmp.androidimpl.presets.generated

import com.swmansion.pulsar.kmp.androidimpl.Pulsar
import com.swmansion.pulsar.kmp.androidimpl.presets.Player
import com.swmansion.pulsar.kmp.androidimpl.types.PatternData
import com.swmansion.pulsar.kmp.androidimpl.types.Preset
import com.swmansion.pulsar.kmp.androidimpl.types.PresetWithName

class RipplePreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(70.0f, 0.0f), listOf(145.0f, 0.5f), listOf(200.0f, 0.0f), listOf(265.0f, 0.2f), listOf(310.0f, 0.0f), listOf(365.0f, 0.07f), listOf(420.0f, 0.0f)),
            listOf(listOf(0.0f, 0.7f), listOf(140.0f, 0.5f), listOf(260.0f, 0.33f), listOf(420.0f, 0.18f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.858f, 0.72f),
            listOf(140.0f, 0.52f, 0.48f),
            listOf(260.0f, 0.22f, 0.32f),
            listOf(360.0f, 0.08f, 0.2f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Ripple"
    }
}
