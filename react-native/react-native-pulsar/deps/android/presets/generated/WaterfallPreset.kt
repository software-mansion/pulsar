package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class WaterfallPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(),
            listOf(),
        ),
        rawDiscretePattern = listOf(
            listOf(1.0f, 0.994f, 0.994f),
            listOf(51.0f, 0.994f, 0.806f),
            listOf(100.0f, 0.991f, 0.597f),
            listOf(156.0f, 1.0f, 0.394f),
            listOf(208.0f, 0.991f, 0.203f),
            listOf(260.0f, 1.0f, 0.094f),
            listOf(309.0f, 1.0f, 0.072f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Waterfall"
    }
}
