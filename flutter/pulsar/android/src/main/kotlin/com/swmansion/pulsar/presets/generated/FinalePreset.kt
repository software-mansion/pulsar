package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class FinalePreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(8.0f, 0.7f), listOf(75.0f, 0.0f), listOf(200.0f, 0.7f), listOf(275.0f, 0.0f), listOf(400.0f, 0.9f), listOf(520.0f, 0.3f), listOf(680.0f, 0.0f)),
            listOf(listOf(0.0f, 0.55f), listOf(400.0f, 0.65f), listOf(680.0f, 0.6f)),
        ),
        rawDiscretePattern = listOf(
            listOf(400.0f, 0.9f, 0.65f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Finale"
    }
}
