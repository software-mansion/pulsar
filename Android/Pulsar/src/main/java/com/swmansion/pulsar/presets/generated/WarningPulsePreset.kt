package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class WarningPulsePreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(8.0f, 0.8f), listOf(80.0f, 0.0f), listOf(150.0f, 0.45f), listOf(230.0f, 0.0f)),
            listOf(listOf(0.0f, 0.65f), listOf(230.0f, 0.6f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.8f, 0.65f),
            listOf(150.0f, 0.45f, 0.6f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "WarningPulse"
    }
}
