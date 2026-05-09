package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class CameraShutterPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(5.0f, 0.6f), listOf(30.0f, 0.05f), listOf(60.0f, 0.8f), listOf(100.0f, 0.1f), listOf(150.0f, 0.0f)),
            listOf(listOf(0.0f, 0.78f), listOf(30.0f, 0.6f), listOf(60.0f, 0.72f), listOf(150.0f, 0.65f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.6f, 0.75f),
            listOf(60.0f, 0.8f, 0.7f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "CameraShutter"
    }
}
