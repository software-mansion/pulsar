package com.swmansion.pulsar.androidimpl.presets.generated

import com.swmansion.pulsar.androidimpl.Pulsar
import com.swmansion.pulsar.androidimpl.presets.Player
import com.swmansion.pulsar.androidimpl.types.PatternData
import com.swmansion.pulsar.androidimpl.types.Preset
import com.swmansion.pulsar.androidimpl.types.PresetWithName

class SparkPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(4.0f, 0.22f), listOf(28.0f, 0.0f), listOf(69.0f, 0.52f), listOf(95.0f, 0.0f), listOf(142.0f, 1.0f), listOf(185.0f, 0.0f)),
            listOf(listOf(0.0f, 0.5f), listOf(65.0f, 0.75f), listOf(138.0f, 1.0f), listOf(185.0f, 1.0f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.22f, 0.55f),
            listOf(65.0f, 0.52f, 0.78f),
            listOf(138.0f, 1.0f, 1.0f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Spark"
    }
}
