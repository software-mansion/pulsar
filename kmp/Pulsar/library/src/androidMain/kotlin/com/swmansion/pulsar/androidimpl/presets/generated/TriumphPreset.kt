package com.swmansion.pulsar.androidimpl.presets.generated

import com.swmansion.pulsar.androidimpl.Pulsar
import com.swmansion.pulsar.androidimpl.presets.Player
import com.swmansion.pulsar.androidimpl.types.PatternData
import com.swmansion.pulsar.androidimpl.types.Preset
import com.swmansion.pulsar.androidimpl.types.PresetWithName

class TriumphPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(10.0f, 0.4f), listOf(70.0f, 0.0f), listOf(120.0f, 0.55f), listOf(180.0f, 0.0f), listOf(260.0f, 0.7f), listOf(320.0f, 0.0f), listOf(420.0f, 0.85f), listOf(480.0f, 0.0f), listOf(600.0f, 1.0f), listOf(660.0f, 0.0f), listOf(750.0f, 1.0f), listOf(810.0f, 0.0f), listOf(900.0f, 1.0f), listOf(980.0f, 0.4f), listOf(1100.0f, 0.0f)),
            listOf(listOf(0.0f, 0.5f), listOf(600.0f, 0.75f), listOf(1100.0f, 0.85f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.4f, 0.55f),
            listOf(120.0f, 0.55f, 0.6f),
            listOf(260.0f, 0.7f, 0.65f),
            listOf(420.0f, 0.85f, 0.7f),
            listOf(600.0f, 1.0f, 0.8f),
            listOf(750.0f, 1.0f, 0.8f),
            listOf(900.0f, 1.0f, 0.8f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Triumph"
    }
}
