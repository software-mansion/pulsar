package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class BreathPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(800.0f, 0.5f), listOf(1600.0f, 0.05f), listOf(2400.0f, 0.5f), listOf(3200.0f, 0.0f)),
            listOf(listOf(0.0f, 0.15f), listOf(800.0f, 0.25f), listOf(1600.0f, 0.1f), listOf(2400.0f, 0.25f), listOf(3200.0f, 0.15f)),
        ),
        rawDiscretePattern = listOf(

        )
    )) {
    companion object: PresetWithName {
        override val name = "Breath"
    }
}
