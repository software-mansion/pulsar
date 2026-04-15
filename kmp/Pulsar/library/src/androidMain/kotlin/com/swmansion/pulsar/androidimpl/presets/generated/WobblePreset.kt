package com.swmansion.pulsar.androidimpl.presets.generated

import com.swmansion.pulsar.androidimpl.Pulsar
import com.swmansion.pulsar.androidimpl.presets.Player
import com.swmansion.pulsar.androidimpl.types.PatternData
import com.swmansion.pulsar.androidimpl.types.Preset
import com.swmansion.pulsar.androidimpl.types.PresetWithName

class WobblePreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(5.0f, 0.65f), listOf(80.0f, 0.5f), listOf(180.0f, 0.0f)),
            listOf(listOf(0.0f, 0.82f), listOf(180.0f, 0.75f)),
        ),
        rawDiscretePattern = listOf(

        )
    )) {
    companion object: PresetWithName {
        override val name = "Wobble"
    }
}
