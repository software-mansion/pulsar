package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class ErrorSoftPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(5.0f, 0.65f), listOf(80.0f, 0.5f), listOf(180.0f, 0.0f)),
            listOf(listOf(0.0f, 0.82f), listOf(180.0f, 0.75f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.65f, 0.82f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "ErrorSoft"
    }
}
