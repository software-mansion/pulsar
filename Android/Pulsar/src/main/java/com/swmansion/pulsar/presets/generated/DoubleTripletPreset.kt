package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class DoubleTripletPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(),
            listOf(),
        ),
        rawDiscretePattern = listOf(
            listOf(1.0f, 0.594f, 0.594f),
            listOf(73.0f, 0.588f, 0.588f),
            listOf(151.0f, 0.588f, 0.588f),
            listOf(299.0f, 0.4f, 0.4f),
            listOf(380.0f, 0.394f, 0.394f),
            listOf(451.0f, 0.394f, 0.394f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "DoubleTriplet"
    }
}
