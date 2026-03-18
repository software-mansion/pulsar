package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class CowboyPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(6.0f, 0.68f), listOf(60.0f, 0.15f), listOf(80.0f, 0.43f), listOf(140.0f, 0.12f), listOf(160.0f, 0.68f), listOf(220.0f, 0.15f), listOf(240.0f, 0.43f), listOf(300.0f, 0.12f), listOf(320.0f, 0.73f), listOf(450.0f, 0.0f)),
            listOf(listOf(0.0f, 0.72f), listOf(450.0f, 0.7f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.7f, 0.72f),
            listOf(80.0f, 0.45f, 0.65f),
            listOf(160.0f, 0.7f, 0.72f),
            listOf(240.0f, 0.45f, 0.65f),
            listOf(320.0f, 0.75f, 0.75f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Cowboy"
    }
}
