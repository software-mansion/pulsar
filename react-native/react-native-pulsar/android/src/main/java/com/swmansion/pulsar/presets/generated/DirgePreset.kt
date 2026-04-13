package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class DirgePreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(30.0f, 0.4f), listOf(300.0f, 0.2f), listOf(700.0f, 0.0f), listOf(900.0f, 0.0f), listOf(930.0f, 0.38f), listOf(1200.0f, 0.18f), listOf(1700.0f, 0.0f), listOf(1900.0f, 0.0f), listOf(1930.0f, 0.32f), listOf(2200.0f, 0.12f), listOf(2600.0f, 0.0f)),
            listOf(listOf(0.0f, 0.14f), listOf(2600.0f, 0.11f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.45f, 0.15f),
            listOf(900.0f, 0.4f, 0.13f),
            listOf(1900.0f, 0.35f, 0.12f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Dirge"
    }
}
