package com.swmansion.pulsar.androidimpl.presets.generated

import com.swmansion.pulsar.androidimpl.Pulsar
import com.swmansion.pulsar.androidimpl.presets.Player
import com.swmansion.pulsar.androidimpl.types.PatternData
import com.swmansion.pulsar.androidimpl.types.Preset
import com.swmansion.pulsar.androidimpl.types.PresetWithName

class FlourishPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(50.0f, 0.2f), listOf(200.0f, 0.65f), listOf(380.0f, 0.95f), listOf(480.0f, 0.5f), listOf(650.0f, 0.0f)),
            listOf(listOf(0.0f, 0.43f), listOf(380.0f, 0.78f), listOf(650.0f, 0.65f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.25f, 0.45f),
            listOf(200.0f, 0.7f, 0.65f),
            listOf(380.0f, 0.95f, 0.78f),
            listOf(500.0f, 0.6f, 0.62f),
            listOf(584.0f, 0.628f, 0.628f),
            listOf(682.0f, 0.6f, 0.6f),
            listOf(754.0f, 0.456f, 0.456f),
            listOf(827.0f, 0.303f, 0.303f),
            listOf(917.0f, 0.2f, 0.2f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Flourish"
    }
}
