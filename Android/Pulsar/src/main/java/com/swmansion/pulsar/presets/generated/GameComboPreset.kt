package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class GameComboPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(5.0f, 0.45f), listOf(40.0f, 0.0f), listOf(60.0f, 0.55f), listOf(95.0f, 0.0f), listOf(115.0f, 0.65f), listOf(148.0f, 0.0f), listOf(165.0f, 0.82f), listOf(240.0f, 0.1f), listOf(300.0f, 0.0f)),
            listOf(listOf(0.0f, 0.55f), listOf(165.0f, 0.72f), listOf(300.0f, 0.7f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.5f, 0.55f),
            listOf(60.0f, 0.6f, 0.6f),
            listOf(115.0f, 0.7f, 0.65f),
            listOf(165.0f, 0.85f, 0.7f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "GameCombo"
    }
}
