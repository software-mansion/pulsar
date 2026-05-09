package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class AlarmPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(10.0f, 0.9f), listOf(130.0f, 0.0f), listOf(200.0f, 0.9f), listOf(330.0f, 0.0f), listOf(400.0f, 0.9f), listOf(530.0f, 0.0f), listOf(600.0f, 0.9f), listOf(730.0f, 0.0f), listOf(800.0f, 0.9f), listOf(930.0f, 0.0f), listOf(1000.0f, 0.9f), listOf(1130.0f, 0.0f)),
            listOf(listOf(0.0f, 0.82f), listOf(130.0f, 0.82f), listOf(200.0f, 0.48f), listOf(330.0f, 0.48f), listOf(400.0f, 0.82f), listOf(530.0f, 0.82f), listOf(600.0f, 0.48f), listOf(730.0f, 0.48f), listOf(800.0f, 0.82f), listOf(930.0f, 0.82f), listOf(1000.0f, 0.48f), listOf(1130.0f, 0.48f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.9f, 0.8f),
            listOf(200.0f, 0.9f, 0.5f),
            listOf(400.0f, 0.9f, 0.8f),
            listOf(600.0f, 0.9f, 0.5f),
            listOf(800.0f, 0.9f, 0.8f),
            listOf(1000.0f, 0.9f, 0.5f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Alarm"
    }
}
