package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class BtnDestructivePreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(5.0f, 0.85f), listOf(65.0f, 0.0f), listOf(100.0f, 0.7f), listOf(165.0f, 0.2f), listOf(250.0f, 0.0f)),
            listOf(listOf(0.0f, 0.8f), listOf(250.0f, 0.76f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.85f, 0.8f),
            listOf(100.0f, 0.7f, 0.78f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "BtnDestructive"
    }
}
