package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class NudgePreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(10.0f, 0.6f), listOf(60.0f, 0.0f), listOf(120.0f, 0.4f), listOf(180.0f, 0.0f)),
            listOf(listOf(0.0f, 0.5f), listOf(180.0f, 0.5f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.6f, 0.5f),
            listOf(120.0f, 0.4f, 0.5f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Nudge"
    }
}
