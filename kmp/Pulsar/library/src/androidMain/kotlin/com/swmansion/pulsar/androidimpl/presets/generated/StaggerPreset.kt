package com.swmansion.pulsar.androidimpl.presets.generated

import com.swmansion.pulsar.androidimpl.Pulsar
import com.swmansion.pulsar.androidimpl.presets.Player
import com.swmansion.pulsar.androidimpl.types.PatternData
import com.swmansion.pulsar.androidimpl.types.Preset
import com.swmansion.pulsar.androidimpl.types.PresetWithName

class StaggerPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(5.0f, 0.68f), listOf(45.0f, 0.15f), listOf(60.0f, 0.38f), listOf(100.0f, 0.15f), listOf(120.0f, 0.52f), listOf(162.0f, 0.12f), listOf(180.0f, 0.33f), listOf(320.0f, 0.0f)),
            listOf(listOf(0.0f, 0.55f), listOf(60.0f, 0.65f), listOf(120.0f, 0.5f), listOf(180.0f, 0.6f), listOf(320.0f, 0.55f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.7f, 0.55f),
            listOf(60.0f, 0.4f, 0.65f),
            listOf(120.0f, 0.55f, 0.5f),
            listOf(180.0f, 0.35f, 0.6f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Stagger"
    }
}
