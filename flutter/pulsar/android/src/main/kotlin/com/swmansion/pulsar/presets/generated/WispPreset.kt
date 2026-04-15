package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class WispPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(8.0f, 0.22f), listOf(60.0f, 0.0f)),
            listOf(listOf(0.0f, 0.48f), listOf(60.0f, 0.48f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.25f, 0.48f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Wisp"
    }
}
