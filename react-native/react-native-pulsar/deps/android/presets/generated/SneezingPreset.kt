package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class SneezingPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(15.0f, 0.18f), listOf(80.0f, 0.4f), listOf(100.0f, 0.85f), listOf(130.0f, 0.3f), listOf(300.0f, 0.0f)),
            listOf(listOf(0.0f, 0.55f), listOf(80.0f, 0.65f), listOf(100.0f, 0.72f), listOf(300.0f, 0.4f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.2f, 0.55f),
            listOf(100.0f, 0.45f, 0.65f),
            listOf(180.0f, 0.9f, 0.7f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Sneezing"
    }
}
