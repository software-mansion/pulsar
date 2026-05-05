package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class MetronomePreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(8.0f, 0.45f), listOf(80.0f, 0.0f), listOf(200.0f, 0.0f), listOf(208.0f, 0.45f), listOf(280.0f, 0.0f)),
            listOf(listOf(0.0f, 0.5f), listOf(280.0f, 0.5f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.5f, 0.5f),
            listOf(200.0f, 0.5f, 0.5f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Metronome"
    }
}
