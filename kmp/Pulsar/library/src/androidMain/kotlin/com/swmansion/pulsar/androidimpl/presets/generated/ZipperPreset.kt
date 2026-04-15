package com.swmansion.pulsar.androidimpl.presets.generated

import com.swmansion.pulsar.androidimpl.Pulsar
import com.swmansion.pulsar.androidimpl.presets.Player
import com.swmansion.pulsar.androidimpl.types.PatternData
import com.swmansion.pulsar.androidimpl.types.Preset
import com.swmansion.pulsar.androidimpl.types.PresetWithName

class ZipperPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(6.0f, 0.234f), listOf(432.0f, 0.231f), listOf(460.0f, 0.0f)),
            listOf(listOf(0.0f, 0.616f), listOf(358.0f, 0.594f), listOf(460.0f, 0.35f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.35f, 0.8f),
            listOf(40.0f, 0.35f, 0.8f),
            listOf(80.0f, 0.35f, 0.8f),
            listOf(120.0f, 0.35f, 0.8f),
            listOf(160.0f, 0.35f, 0.8f),
            listOf(200.0f, 0.35f, 0.8f),
            listOf(240.0f, 0.35f, 0.8f),
            listOf(280.0f, 0.35f, 0.8f),
            listOf(320.0f, 0.35f, 0.8f),
            listOf(360.0f, 0.35f, 0.8f),
            listOf(400.0f, 0.35f, 0.8f),
            listOf(430.0f, 0.6f, 0.75f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Zipper"
    }
}
