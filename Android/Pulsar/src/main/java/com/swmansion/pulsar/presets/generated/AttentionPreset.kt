package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class AttentionPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(10.0f, 0.8f), listOf(180.0f, 0.0f), listOf(300.0f, 0.7f), listOf(370.0f, 0.0f), listOf(430.0f, 0.7f), listOf(500.0f, 0.0f)),
            listOf(listOf(0.0f, 0.52f), listOf(180.0f, 0.52f), listOf(300.0f, 0.62f), listOf(500.0f, 0.62f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.8f, 0.55f),
            listOf(300.0f, 0.7f, 0.6f),
            listOf(430.0f, 0.7f, 0.6f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Attention"
    }
}
