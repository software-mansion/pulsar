package com.swmansion.pulsar.kmp.androidimpl.presets.generated

import com.swmansion.pulsar.kmp.androidimpl.Pulsar
import com.swmansion.pulsar.kmp.androidimpl.presets.Player
import com.swmansion.pulsar.kmp.androidimpl.types.PatternData
import com.swmansion.pulsar.kmp.androidimpl.types.Preset
import com.swmansion.pulsar.kmp.androidimpl.types.PresetWithName

class BreakingWavePreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(),
            listOf(),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.497f, 0.497f),
            listOf(89.0f, 0.497f, 0.497f),
            listOf(202.0f, 1.0f, 0.1f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "BreakingWave"
    }
}
