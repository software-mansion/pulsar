package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class NewMessagePreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(8.0f, 0.5f), listOf(70.0f, 0.08f), listOf(150.0f, 0.0f), listOf(180.0f, 0.7f), listOf(260.0f, 0.12f), listOf(380.0f, 0.0f)),
            listOf(listOf(0.0f, 0.48f), listOf(150.0f, 0.48f), listOf(180.0f, 0.65f), listOf(380.0f, 0.6f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.5f, 0.5f),
            listOf(180.0f, 0.7f, 0.65f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "NewMessage"
    }
}
