package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class NotifyReminderSoftPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(10.0f, 0.45f), listOf(70.0f, 0.15f), listOf(180.0f, 0.0f)),
            listOf(listOf(0.0f, 0.42f), listOf(180.0f, 0.38f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.45f, 0.45f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "NotifyReminderSoft"
    }
}
