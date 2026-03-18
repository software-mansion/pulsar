package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class BtnToggleOffPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(5.0f, 0.72f), listOf(60.0f, 0.15f), listOf(100.0f, 0.38f), listOf(170.0f, 0.08f), listOf(230.0f, 0.0f)),
            listOf(listOf(0.0f, 0.68f), listOf(100.0f, 0.45f), listOf(230.0f, 0.42f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.75f, 0.68f),
            listOf(100.0f, 0.4f, 0.45f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "BtnToggleOff"
    }
}
