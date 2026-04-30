package com.swmansion.pulsar.kmp.androidimpl.presets.generated

import com.swmansion.pulsar.kmp.androidimpl.Pulsar
import com.swmansion.pulsar.kmp.androidimpl.presets.Player
import com.swmansion.pulsar.kmp.androidimpl.types.PatternData
import com.swmansion.pulsar.kmp.androidimpl.types.Preset
import com.swmansion.pulsar.kmp.androidimpl.types.PresetWithName

class DronePreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(20.0f, 0.28f), listOf(180.0f, 0.28f), listOf(280.0f, 0.0f), listOf(500.0f, 0.0f), listOf(520.0f, 0.28f), listOf(680.0f, 0.28f), listOf(780.0f, 0.0f), listOf(1000.0f, 0.0f), listOf(1020.0f, 0.28f), listOf(1180.0f, 0.28f), listOf(1280.0f, 0.0f), listOf(1500.0f, 0.0f), listOf(1520.0f, 0.28f), listOf(1680.0f, 0.28f), listOf(1780.0f, 0.0f)),
            listOf(listOf(0.0f, 0.45f), listOf(1780.0f, 0.45f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.3f, 0.45f),
            listOf(500.0f, 0.3f, 0.45f),
            listOf(1000.0f, 0.3f, 0.45f),
            listOf(1500.0f, 0.3f, 0.45f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Drone"
    }
}
