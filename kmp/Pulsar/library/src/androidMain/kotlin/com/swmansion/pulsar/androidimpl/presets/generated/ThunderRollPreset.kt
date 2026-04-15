package com.swmansion.pulsar.androidimpl.presets.generated

import com.swmansion.pulsar.androidimpl.Pulsar
import com.swmansion.pulsar.androidimpl.presets.Player
import com.swmansion.pulsar.androidimpl.types.PatternData
import com.swmansion.pulsar.androidimpl.types.Preset
import com.swmansion.pulsar.androidimpl.types.PresetWithName

class ThunderRollPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(),
            listOf(),
        ),
        rawDiscretePattern = listOf(
            listOf(1.0f, 0.994f, 0.053f),
            listOf(51.0f, 0.994f, 0.122f),
            listOf(100.0f, 0.991f, 0.228f),
            listOf(156.0f, 1.0f, 0.394f),
            listOf(208.0f, 0.991f, 0.613f),
            listOf(260.0f, 1.0f, 0.803f),
            listOf(309.0f, 1.0f, 1.0f),
            listOf(368.0f, 1.0f, 1.0f),
            listOf(420.0f, 0.8f, 0.8f),
            listOf(482.0f, 0.606f, 0.606f),
            listOf(544.0f, 0.394f, 0.394f),
            listOf(605.0f, 0.194f, 0.194f),
            listOf(670.0f, 0.091f, 0.091f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "ThunderRoll"
    }
}
