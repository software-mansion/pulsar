package com.swmansion.pulsar.androidimpl.presets.generated

import com.swmansion.pulsar.androidimpl.Pulsar
import com.swmansion.pulsar.androidimpl.presets.Player
import com.swmansion.pulsar.androidimpl.types.PatternData
import com.swmansion.pulsar.androidimpl.types.Preset
import com.swmansion.pulsar.androidimpl.types.PresetWithName

class ApplausePreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(10.0f, 0.2f), listOf(1482.0f, 0.266f), listOf(1564.0f, 0.0f)),
            listOf(listOf(0.0f, 0.5f), listOf(990.0f, 0.72f), listOf(1250.0f, 0.7f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.2f, 0.5f),
            listOf(150.0f, 0.25f, 0.52f),
            listOf(290.0f, 0.3f, 0.54f),
            listOf(420.0f, 0.4f, 0.56f),
            listOf(540.0f, 0.5f, 0.58f),
            listOf(650.0f, 0.484f, 0.6f),
            listOf(750.0f, 0.509f, 0.62f),
            listOf(868.0f, 0.503f, 0.65f),
            listOf(968.0f, 0.45f, 0.716f),
            listOf(1063.0f, 0.434f, 0.725f),
            listOf(1159.0f, 0.488f, 0.759f),
            listOf(1256.0f, 0.506f, 1.0f),
            listOf(1349.0f, 0.528f, 1.0f),
            listOf(1432.0f, 0.519f, 1.0f),
            listOf(1530.0f, 0.528f, 1.0f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Applause"
    }
}
