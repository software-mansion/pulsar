package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class KeyboardTypewriterOldPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(6.0f, 0.85f), listOf(40.0f, 0.3f), listOf(55.0f, 0.38f), listOf(90.0f, 0.12f), listOf(110.0f, 0.15f), listOf(160.0f, 0.04f), listOf(200.0f, 0.0f)),
            listOf(listOf(0.0f, 0.42f), listOf(55.0f, 0.38f), listOf(200.0f, 0.34f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.88f, 0.42f),
            listOf(55.0f, 0.35f, 0.38f),
            listOf(110.0f, 0.12f, 0.35f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "KeyboardTypewriterOld"
    }
}
