package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class TideSwellPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(),
            listOf(),
        ),
        rawDiscretePattern = listOf(
            listOf(1.0f, 0.775f, 0.053f),
            listOf(51.0f, 0.722f, 0.122f),
            listOf(100.0f, 0.7f, 0.228f),
            listOf(156.0f, 0.653f, 0.394f),
            listOf(208.0f, 0.638f, 0.613f),
            listOf(260.0f, 0.622f, 0.803f),
            listOf(309.0f, 0.606f, 1.0f),
            listOf(368.0f, 0.6f, 1.0f),
            listOf(420.0f, 0.606f, 0.8f),
            listOf(482.0f, 0.609f, 0.606f),
            listOf(549.0f, 0.647f, 0.394f),
            listOf(605.0f, 0.684f, 0.181f),
            listOf(670.0f, 0.728f, 0.075f),
            listOf(727.0f, 0.775f, 0.034f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "TideSwell"
    }
}
