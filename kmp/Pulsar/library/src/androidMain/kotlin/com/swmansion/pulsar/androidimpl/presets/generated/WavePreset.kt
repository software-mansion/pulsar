package com.swmansion.pulsar.kmp.androidimpl.presets.generated

import com.swmansion.pulsar.kmp.androidimpl.Pulsar
import com.swmansion.pulsar.kmp.androidimpl.presets.Player
import com.swmansion.pulsar.kmp.androidimpl.types.PatternData
import com.swmansion.pulsar.kmp.androidimpl.types.Preset
import com.swmansion.pulsar.kmp.androidimpl.types.PresetWithName

class WavePreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(400.0f, 0.38f), listOf(800.0f, 0.05f), listOf(1200.0f, 0.4f), listOf(1600.0f, 0.05f), listOf(2000.0f, 0.38f), listOf(2400.0f, 0.05f), listOf(2800.0f, 0.0f)),
            listOf(listOf(0.0f, 0.35f), listOf(2800.0f, 0.35f)),
        ),
        rawDiscretePattern = listOf(

        )
    )) {
    companion object: PresetWithName {
        override val name = "Wave"
    }
}
