package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class NotifyWarnMildPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(8.0f, 0.65f), listOf(75.0f, 0.05f), listOf(200.0f, 0.3f), listOf(290.0f, 0.0f)),
            listOf(listOf(0.0f, 0.6f), listOf(200.0f, 0.48f), listOf(290.0f, 0.45f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.65f, 0.6f),
            listOf(200.0f, 0.3f, 0.5f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "NotifyWarnMild"
    }
}
