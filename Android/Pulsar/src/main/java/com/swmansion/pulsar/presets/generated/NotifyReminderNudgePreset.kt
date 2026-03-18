package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class NotifyReminderNudgePreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(10.0f, 0.45f), listOf(75.0f, 0.0f), listOf(350.0f, 0.65f), listOf(425.0f, 0.0f)),
            listOf(listOf(0.0f, 0.45f), listOf(350.0f, 0.52f), listOf(425.0f, 0.52f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.45f, 0.48f),
            listOf(350.0f, 0.65f, 0.52f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "NotifyReminderNudge"
    }
}
