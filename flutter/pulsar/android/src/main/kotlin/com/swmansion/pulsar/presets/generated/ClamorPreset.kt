package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class ClamorPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(8.0f, 0.78f), listOf(70.0f, 0.0f), listOf(120.0f, 0.78f), listOf(190.0f, 0.0f), listOf(240.0f, 0.78f), listOf(310.0f, 0.0f), listOf(360.0f, 0.78f), listOf(430.0f, 0.0f)),
            listOf(listOf(0.0f, 0.68f), listOf(430.0f, 0.68f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.8f, 0.68f),
            listOf(120.0f, 0.8f, 0.68f),
            listOf(240.0f, 0.8f, 0.68f),
            listOf(360.0f, 0.8f, 0.68f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Clamor"
    }
}
