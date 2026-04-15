package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class ThunderPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(100.0f, 0.05f), listOf(300.0f, 0.1f), listOf(500.0f, 0.2f), listOf(590.0f, 0.3f), listOf(600.0f, 1.0f), listOf(680.0f, 0.7f), listOf(800.0f, 0.5f), listOf(1000.0f, 0.3f), listOf(1300.0f, 0.15f), listOf(1700.0f, 0.05f), listOf(2000.0f, 0.0f)),
            listOf(listOf(0.0f, 0.1f), listOf(600.0f, 0.08f), listOf(2000.0f, 0.05f)),
        ),
        rawDiscretePattern = listOf(
            listOf(600.0f, 1.0f, 0.15f),
            listOf(700.0f, 0.8f, 0.12f),
            listOf(900.0f, 0.5f, 0.1f),
            listOf(1200.0f, 0.3f, 0.08f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Thunder"
    }
}
