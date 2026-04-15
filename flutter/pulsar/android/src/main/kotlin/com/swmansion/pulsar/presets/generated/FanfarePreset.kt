package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class FanfarePreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(8.0f, 0.6f), listOf(80.0f, 0.0f), listOf(130.0f, 0.7f), listOf(200.0f, 0.0f), listOf(250.0f, 0.8f), listOf(315.0f, 0.0f), listOf(360.0f, 1.0f), listOf(460.0f, 0.5f), listOf(580.0f, 0.0f)),
            listOf(listOf(0.0f, 0.38f), listOf(130.0f, 0.52f), listOf(250.0f, 0.62f), listOf(360.0f, 0.78f), listOf(580.0f, 0.82f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.6f, 0.4f),
            listOf(130.0f, 0.7f, 0.55f),
            listOf(250.0f, 0.8f, 0.65f),
            listOf(360.0f, 1.0f, 0.8f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Fanfare"
    }
}
