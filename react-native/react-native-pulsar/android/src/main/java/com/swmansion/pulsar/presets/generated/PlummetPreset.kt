package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class PlummetPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(300.0f, 0.02f), listOf(600.0f, 0.06f), listOf(800.0f, 0.15f), listOf(880.0f, 0.3f), listOf(895.0f, 0.5f), listOf(900.0f, 0.0f), listOf(905.0f, 1.0f), listOf(960.0f, 0.4f), listOf(1050.0f, 0.0f)),
            listOf(listOf(0.0f, 0.3f), listOf(895.0f, 0.4f), listOf(905.0f, 0.3f), listOf(1050.0f, 0.25f)),
        ),
        rawDiscretePattern = listOf(
            listOf(900.0f, 1.0f, 0.4f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Plummet"
    }
}
