package com.swmansion.pulsar.androidimpl.presets.generated

import com.swmansion.pulsar.androidimpl.Pulsar
import com.swmansion.pulsar.androidimpl.presets.Player
import com.swmansion.pulsar.androidimpl.types.PatternData
import com.swmansion.pulsar.androidimpl.types.Preset
import com.swmansion.pulsar.androidimpl.types.PresetWithName

class SnapPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(4.0f, 0.7f), listOf(30.0f, 0.15f), listOf(40.0f, 0.3f), listOf(90.0f, 0.0f)),
            listOf(listOf(0.0f, 0.55f), listOf(40.0f, 0.47f), listOf(90.0f, 0.45f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.7f, 0.55f),
            listOf(40.0f, 0.3f, 0.48f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Snap"
    }
}
