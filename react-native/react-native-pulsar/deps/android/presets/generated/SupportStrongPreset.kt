package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class SupportStrongPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(15.0f, 0.6f), listOf(150.0f, 0.45f), listOf(250.0f, 0.0f), listOf(300.0f, 0.0f), listOf(315.0f, 0.65f), listOf(450.0f, 0.5f), listOf(550.0f, 0.0f), listOf(600.0f, 0.0f), listOf(615.0f, 0.6f), listOf(750.0f, 0.4f), listOf(900.0f, 0.0f)),
            listOf(listOf(0.0f, 0.25f), listOf(900.0f, 0.25f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.65f, 0.28f),
            listOf(300.0f, 0.7f, 0.28f),
            listOf(600.0f, 0.65f, 0.28f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "SupportStrong"
    }
}
