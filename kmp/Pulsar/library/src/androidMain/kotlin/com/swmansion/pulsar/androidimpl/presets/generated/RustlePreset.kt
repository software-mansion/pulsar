package com.swmansion.pulsar.androidimpl.presets.generated

import com.swmansion.pulsar.androidimpl.Pulsar
import com.swmansion.pulsar.androidimpl.presets.Player
import com.swmansion.pulsar.androidimpl.types.PatternData
import com.swmansion.pulsar.androidimpl.types.Preset
import com.swmansion.pulsar.androidimpl.types.PresetWithName

class RustlePreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(8.0f, 0.65f), listOf(75.0f, 0.05f), listOf(200.0f, 0.3f), listOf(290.0f, 0.0f)),
            listOf(listOf(0.0f, 0.6f), listOf(200.0f, 0.48f), listOf(290.0f, 0.45f)),
        ),
        rawDiscretePattern = listOf(

        )
    )) {
    companion object: PresetWithName {
        override val name = "Rustle"
    }
}
