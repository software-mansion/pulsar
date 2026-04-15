package com.swmansion.pulsar.androidimpl.presets.generated

import com.swmansion.pulsar.androidimpl.Pulsar
import com.swmansion.pulsar.androidimpl.presets.Player
import com.swmansion.pulsar.androidimpl.types.PatternData
import com.swmansion.pulsar.androidimpl.types.Preset
import com.swmansion.pulsar.androidimpl.types.PresetWithName

class HeartbeatPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(10.0f, 0.8f), listOf(80.0f, 0.0f), listOf(120.0f, 0.5f), listOf(200.0f, 0.0f), listOf(800.0f, 0.0f), listOf(810.0f, 0.8f), listOf(880.0f, 0.0f), listOf(920.0f, 0.5f), listOf(1000.0f, 0.0f)),
            listOf(listOf(0.0f, 0.2f), listOf(1000.0f, 0.2f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.9f, 0.2f),
            listOf(120.0f, 0.6f, 0.2f),
            listOf(800.0f, 0.9f, 0.2f),
            listOf(920.0f, 0.6f, 0.2f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Heartbeat"
    }
}
