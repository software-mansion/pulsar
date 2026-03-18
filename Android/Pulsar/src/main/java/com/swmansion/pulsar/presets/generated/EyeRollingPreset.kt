package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class EyeRollingPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(20.0f, 0.42f), listOf(180.0f, 0.22f), listOf(450.0f, 0.0f)),
            listOf(listOf(0.0f, 0.5f), listOf(180.0f, 0.4f), listOf(450.0f, 0.35f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.45f, 0.5f),
            listOf(180.0f, 0.25f, 0.4f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "EyeRolling"
    }
}
