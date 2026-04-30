package com.swmansion.pulsar.kmp.androidimpl.presets.generated

import com.swmansion.pulsar.kmp.androidimpl.Pulsar
import com.swmansion.pulsar.kmp.androidimpl.presets.Player
import com.swmansion.pulsar.kmp.androidimpl.types.PatternData
import com.swmansion.pulsar.kmp.androidimpl.types.Preset
import com.swmansion.pulsar.kmp.androidimpl.types.PresetWithName

class LamentPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(5.0f, 0.85f), listOf(190.0f, 0.3f), listOf(295.0f, 0.0f), listOf(355.0f, 0.7f), listOf(535.0f, 0.25f), listOf(645.0f, 0.0f), listOf(705.0f, 0.55f), listOf(880.0f, 0.18f), listOf(995.0f, 0.0f), listOf(1055.0f, 0.75f), listOf(1620.0f, 0.35f), listOf(2150.0f, 0.1f), listOf(2450.0f, 0.0f)),
            listOf(listOf(0.0f, 0.55f), listOf(350.0f, 0.42f), listOf(700.0f, 0.37f), listOf(1050.0f, 0.3f), listOf(2450.0f, 0.26f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.85f, 0.55f),
            listOf(350.0f, 0.7f, 0.42f),
            listOf(700.0f, 0.55f, 0.37f),
            listOf(1050.0f, 0.75f, 0.3f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Lament"
    }
}
