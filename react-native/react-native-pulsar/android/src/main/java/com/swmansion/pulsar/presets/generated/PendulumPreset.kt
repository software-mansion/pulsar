package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class PendulumPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.7f), listOf(300.0f, 0.08f), listOf(600.0f, 0.5f), listOf(900.0f, 0.05f), listOf(1200.0f, 0.3f), listOf(1500.0f, 0.03f), listOf(1800.0f, 0.15f), listOf(2100.0f, 0.01f), listOf(2400.0f, 0.0f)),
            listOf(listOf(0.0f, 0.42f), listOf(2400.0f, 0.38f)),
        ),
        rawDiscretePattern = listOf(
            listOf(300.0f, 0.12f, 0.35f),
            listOf(900.0f, 0.08f, 0.35f),
            listOf(1500.0f, 0.05f, 0.35f),
            listOf(2100.0f, 0.02f, 0.35f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Pendulum"
    }
}
