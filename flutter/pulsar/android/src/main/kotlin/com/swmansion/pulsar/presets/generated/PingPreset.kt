package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class PingPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(4.0f, 0.65f), listOf(35.0f, 0.0f)),
            listOf(listOf(0.0f, 0.72f), listOf(35.0f, 0.68f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.65f, 0.72f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Ping"
    }
}
