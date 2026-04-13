package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class KnockPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(8.0f, 0.65f), listOf(70.0f, 0.08f), listOf(200.0f, 0.0f), listOf(280.0f, 0.65f), listOf(348.0f, 0.08f), listOf(480.0f, 0.0f), listOf(560.0f, 0.65f), listOf(628.0f, 0.08f), listOf(760.0f, 0.0f)),
            listOf(listOf(0.0f, 0.32f), listOf(760.0f, 0.32f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.65f, 0.35f),
            listOf(280.0f, 0.65f, 0.35f),
            listOf(560.0f, 0.65f, 0.35f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Knock"
    }
}
