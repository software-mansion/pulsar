package com.swmansion.pulsar.androidimpl.presets.generated

import com.swmansion.pulsar.androidimpl.Pulsar
import com.swmansion.pulsar.androidimpl.presets.Player
import com.swmansion.pulsar.androidimpl.types.PatternData
import com.swmansion.pulsar.androidimpl.types.Preset
import com.swmansion.pulsar.androidimpl.types.PresetWithName

class ChirpPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(10.0f, 0.35f), listOf(80.0f, 0.0f), listOf(150.0f, 0.45f), listOf(230.0f, 0.0f), listOf(280.0f, 0.55f), listOf(360.0f, 0.0f)),
            listOf(listOf(0.0f, 0.6f), listOf(360.0f, 0.72f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.4f, 0.65f),
            listOf(150.0f, 0.5f, 0.68f),
            listOf(280.0f, 0.6f, 0.72f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Chirp"
    }
}
