package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class PlinkPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(8.0f, 0.55f), listOf(65.0f, 0.0f), listOf(150.0f, 0.55f), listOf(215.0f, 0.0f)),
            listOf(listOf(0.0f, 0.52f), listOf(215.0f, 0.52f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.55f, 0.52f),
            listOf(150.0f, 0.55f, 0.52f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Plink"
    }
}
