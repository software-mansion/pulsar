package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class ShockwavePreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(5.0f, 1.0f), listOf(50.0f, 0.7f), listOf(120.0f, 0.45f), listOf(200.0f, 0.3f), listOf(320.0f, 0.15f), listOf(450.0f, 0.08f), listOf(600.0f, 0.03f), listOf(800.0f, 0.0f)),
            listOf(listOf(0.0f, 0.4f), listOf(5.0f, 0.3f), listOf(800.0f, 0.2f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 1.0f, 0.35f),
            listOf(200.0f, 0.4f, 0.3f),
            listOf(450.0f, 0.15f, 0.25f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Shockwave"
    }
}
