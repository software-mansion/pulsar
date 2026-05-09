package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class BalloonPopPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(50.0f, 0.1f), listOf(200.0f, 0.0f), listOf(300.0f, 0.15f), listOf(500.0f, 0.0f), listOf(600.0f, 0.25f), listOf(800.0f, 0.0f), listOf(900.0f, 0.35f), listOf(1100.0f, 0.0f), listOf(1200.0f, 0.5f), listOf(1380.0f, 0.0f), listOf(1400.0f, 1.0f), listOf(1440.0f, 0.6f), listOf(1550.0f, 0.1f), listOf(1700.0f, 0.0f)),
            listOf(listOf(0.0f, 0.2f), listOf(1380.0f, 0.5f), listOf(1400.0f, 1.0f), listOf(1700.0f, 0.3f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.1f, 0.3f),
            listOf(300.0f, 0.2f, 0.35f),
            listOf(600.0f, 0.3f, 0.4f),
            listOf(900.0f, 0.45f, 0.45f),
            listOf(1200.0f, 0.6f, 0.5f),
            listOf(1400.0f, 1.0f, 0.9f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "BalloonPop"
    }
}
