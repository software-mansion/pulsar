package com.swmansion.pulsar.androidimpl.presets.generated

import com.swmansion.pulsar.androidimpl.Pulsar
import com.swmansion.pulsar.androidimpl.presets.Player
import com.swmansion.pulsar.androidimpl.types.PatternData
import com.swmansion.pulsar.androidimpl.types.Preset
import com.swmansion.pulsar.androidimpl.types.PresetWithName

class UnfurlPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(5.0f, 0.5f), listOf(68.0f, 0.0f), listOf(93.0f, 0.62f), listOf(158.0f, 0.0f), listOf(183.0f, 0.74f), listOf(248.0f, 0.0f), listOf(273.0f, 0.86f), listOf(338.0f, 0.0f), listOf(363.0f, 1.0f), listOf(850.0f, 0.6f), listOf(1050.0f, 0.2f), listOf(1180.0f, 0.0f)),
            listOf(listOf(0.0f, 0.28f), listOf(90.0f, 0.4f), listOf(180.0f, 0.49f), listOf(270.0f, 0.62f), listOf(360.0f, 0.7f), listOf(1180.0f, 0.7f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.5f, 0.28f),
            listOf(90.0f, 0.62f, 0.4f),
            listOf(180.0f, 0.74f, 0.49f),
            listOf(270.0f, 0.86f, 0.62f),
            listOf(360.0f, 1.0f, 0.7f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Unfurl"
    }
}
