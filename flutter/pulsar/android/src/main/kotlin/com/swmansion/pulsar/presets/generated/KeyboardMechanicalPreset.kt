package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class KeyboardMechanicalPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(4.0f, 0.52f), listOf(18.0f, 0.2f), listOf(22.0f, 0.7f), listOf(38.0f, 0.15f), listOf(55.0f, 0.0f)),
            listOf(listOf(0.0f, 0.68f), listOf(22.0f, 0.76f), listOf(55.0f, 0.7f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.55f, 0.68f),
            listOf(22.0f, 0.72f, 0.74f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "KeyboardMechanical"
    }
}
