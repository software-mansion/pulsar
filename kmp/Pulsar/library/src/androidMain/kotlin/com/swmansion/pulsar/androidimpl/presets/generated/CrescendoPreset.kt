package com.swmansion.pulsar.androidimpl.presets.generated

import com.swmansion.pulsar.androidimpl.Pulsar
import com.swmansion.pulsar.androidimpl.presets.Player
import com.swmansion.pulsar.androidimpl.types.PatternData
import com.swmansion.pulsar.androidimpl.types.Preset
import com.swmansion.pulsar.androidimpl.types.PresetWithName

class CrescendoPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(),
            listOf(),
        ),
        rawDiscretePattern = listOf(
            listOf(1.0f, 0.303f, 0.303f),
            listOf(99.0f, 0.397f, 0.397f),
            listOf(202.0f, 0.506f, 0.506f),
            listOf(300.0f, 0.609f, 0.609f),
            listOf(399.0f, 0.703f, 0.703f),
            listOf(502.0f, 0.809f, 0.809f),
            listOf(601.0f, 0.981f, 0.981f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Crescendo"
    }
}
