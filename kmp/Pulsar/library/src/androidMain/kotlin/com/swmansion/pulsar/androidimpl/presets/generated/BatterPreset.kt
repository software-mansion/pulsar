package com.swmansion.pulsar.androidimpl.presets.generated

import com.swmansion.pulsar.androidimpl.Pulsar
import com.swmansion.pulsar.androidimpl.presets.Player
import com.swmansion.pulsar.androidimpl.types.PatternData
import com.swmansion.pulsar.androidimpl.types.Preset
import com.swmansion.pulsar.androidimpl.types.PresetWithName

class BatterPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(5.0f, 0.9f), listOf(45.0f, 0.35f), listOf(60.0f, 0.8f), listOf(102.0f, 0.32f), listOf(120.0f, 0.93f), listOf(158.0f, 0.35f), listOf(175.0f, 0.83f), listOf(208.0f, 0.38f), listOf(225.0f, 1.0f), listOf(380.0f, 0.0f)),
            listOf(listOf(0.0f, 0.35f), listOf(225.0f, 0.38f), listOf(380.0f, 0.32f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.9f, 0.35f),
            listOf(60.0f, 0.82f, 0.32f),
            listOf(120.0f, 0.95f, 0.36f),
            listOf(175.0f, 0.85f, 0.33f),
            listOf(225.0f, 1.0f, 0.38f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Batter"
    }
}
