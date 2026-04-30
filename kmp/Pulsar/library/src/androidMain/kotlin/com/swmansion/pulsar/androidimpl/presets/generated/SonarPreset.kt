package com.swmansion.pulsar.kmp.androidimpl.presets.generated

import com.swmansion.pulsar.kmp.androidimpl.Pulsar
import com.swmansion.pulsar.kmp.androidimpl.presets.Player
import com.swmansion.pulsar.kmp.androidimpl.types.PatternData
import com.swmansion.pulsar.kmp.androidimpl.types.Preset
import com.swmansion.pulsar.kmp.androidimpl.types.PresetWithName

class SonarPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(8.0f, 0.35f), listOf(130.0f, 0.04f), listOf(500.0f, 0.0f), listOf(600.0f, 0.35f), listOf(730.0f, 0.04f), listOf(1100.0f, 0.0f), listOf(1200.0f, 0.35f), listOf(1330.0f, 0.04f), listOf(1550.0f, 0.0f), listOf(1620.0f, 0.0f), listOf(1663.0f, 0.855f), listOf(1700.0f, 0.0f), listOf(1800.0f, 0.65f), listOf(1855.0f, 0.0f), listOf(1920.0f, 0.4f), listOf(2000.0f, 0.0f)),
            listOf(listOf(0.0f, 0.72f), listOf(1550.0f, 0.72f), listOf(1655.0f, 0.8f), listOf(2000.0f, 0.7f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.35f, 0.7f),
            listOf(600.0f, 0.35f, 0.7f),
            listOf(1200.0f, 0.35f, 0.7f),
            listOf(1800.0f, 0.65f, 0.65f),
            listOf(1920.0f, 0.4f, 0.6f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Sonar"
    }
}
