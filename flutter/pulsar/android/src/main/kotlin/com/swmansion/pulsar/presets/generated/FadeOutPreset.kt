package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class FadeOutPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(),
            listOf(),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 1.0f, 1.0f),
            listOf(86.0f, 0.8f, 0.8f),
            listOf(192.0f, 0.603f, 0.603f),
            listOf(298.0f, 0.406f, 0.406f),
            listOf(408.0f, 0.291f, 0.209f),
            listOf(506.0f, 0.297f, 0.075f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "FadeOut"
    }
}
