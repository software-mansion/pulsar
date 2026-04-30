package com.swmansion.pulsar.kmp.androidimpl.presets.generated

import com.swmansion.pulsar.kmp.androidimpl.Pulsar
import com.swmansion.pulsar.kmp.androidimpl.presets.Player
import com.swmansion.pulsar.kmp.androidimpl.types.PatternData
import com.swmansion.pulsar.kmp.androidimpl.types.Preset
import com.swmansion.pulsar.kmp.androidimpl.types.PresetWithName

class WoodpeckerPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(5.0f, 0.65f), listOf(430.0f, 0.65f), listOf(460.0f, 0.0f)),
            listOf(listOf(0.0f, 0.82f), listOf(460.0f, 0.82f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.75f, 0.82f),
            listOf(45.0f, 0.75f, 0.82f),
            listOf(90.0f, 0.75f, 0.82f),
            listOf(135.0f, 0.75f, 0.82f),
            listOf(180.0f, 0.75f, 0.82f),
            listOf(225.0f, 0.75f, 0.82f),
            listOf(270.0f, 0.75f, 0.82f),
            listOf(315.0f, 0.75f, 0.82f),
            listOf(360.0f, 0.75f, 0.82f),
            listOf(405.0f, 0.75f, 0.82f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Woodpecker"
    }
}
