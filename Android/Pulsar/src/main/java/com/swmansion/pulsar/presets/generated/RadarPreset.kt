package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class RadarPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(6.0f, 0.55f), listOf(50.0f, 0.2f), listOf(120.0f, 0.0f), listOf(800.0f, 0.0f), listOf(806.0f, 0.55f), listOf(850.0f, 0.2f), listOf(920.0f, 0.0f), listOf(1600.0f, 0.0f), listOf(1606.0f, 0.55f), listOf(1650.0f, 0.2f), listOf(1720.0f, 0.0f), listOf(2400.0f, 0.0f), listOf(2406.0f, 0.55f), listOf(2450.0f, 0.2f), listOf(2520.0f, 0.0f)),
            listOf(listOf(0.0f, 0.55f), listOf(2520.0f, 0.55f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.55f, 0.55f),
            listOf(800.0f, 0.55f, 0.55f),
            listOf(1600.0f, 0.55f, 0.55f),
            listOf(2400.0f, 0.55f, 0.55f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Radar"
    }
}
