package com.swmansion.pulsar.androidimpl.presets.generated

import com.swmansion.pulsar.androidimpl.Pulsar
import com.swmansion.pulsar.androidimpl.presets.Player
import com.swmansion.pulsar.androidimpl.types.PatternData
import com.swmansion.pulsar.androidimpl.types.Preset
import com.swmansion.pulsar.androidimpl.types.PresetWithName

class BarragePreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(),
            listOf(),
        ),
        rawDiscretePattern = listOf(
            listOf(1.0f, 0.994f, 0.994f),
            listOf(51.0f, 0.994f, 0.994f),
            listOf(100.0f, 0.991f, 0.991f),
            listOf(156.0f, 1.0f, 1.0f),
            listOf(208.0f, 0.991f, 0.991f),
            listOf(260.0f, 1.0f, 1.0f),
            listOf(309.0f, 1.0f, 1.0f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Barrage"
    }
}
