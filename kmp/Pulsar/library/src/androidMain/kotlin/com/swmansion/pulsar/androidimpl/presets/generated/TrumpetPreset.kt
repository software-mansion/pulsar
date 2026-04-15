package com.swmansion.pulsar.androidimpl.presets.generated

import com.swmansion.pulsar.androidimpl.Pulsar
import com.swmansion.pulsar.androidimpl.presets.Player
import com.swmansion.pulsar.androidimpl.types.PatternData
import com.swmansion.pulsar.androidimpl.types.Preset
import com.swmansion.pulsar.androidimpl.types.PresetWithName

class TrumpetPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(10.0f, 0.3f), listOf(40.0f, 0.0f), listOf(80.0f, 0.4f), listOf(110.0f, 0.0f), listOf(150.0f, 0.5f), listOf(175.0f, 0.0f), listOf(210.0f, 0.6f), listOf(232.0f, 0.0f), listOf(260.0f, 0.7f), listOf(278.0f, 0.0f), listOf(310.0f, 1.0f), listOf(380.0f, 0.6f), listOf(460.0f, 0.0f)),
            listOf(listOf(0.0f, 0.4f), listOf(310.0f, 0.7f), listOf(460.0f, 0.9f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.3f, 0.5f),
            listOf(80.0f, 0.4f, 0.55f),
            listOf(150.0f, 0.5f, 0.6f),
            listOf(210.0f, 0.6f, 0.65f),
            listOf(260.0f, 0.7f, 0.7f),
            listOf(310.0f, 1.0f, 0.85f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Trumpet"
    }
}
