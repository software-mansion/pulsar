package com.swmansion.pulsar.androidimpl.presets.generated

import com.swmansion.pulsar.androidimpl.Pulsar
import com.swmansion.pulsar.androidimpl.presets.Player
import com.swmansion.pulsar.androidimpl.types.PatternData
import com.swmansion.pulsar.androidimpl.types.Preset
import com.swmansion.pulsar.androidimpl.types.PresetWithName

class PeckPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(4.0f, 0.55f), listOf(28.0f, 0.0f)),
            listOf(listOf(0.0f, 0.58f), listOf(28.0f, 0.56f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.55f, 0.58f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Peck"
    }
}
