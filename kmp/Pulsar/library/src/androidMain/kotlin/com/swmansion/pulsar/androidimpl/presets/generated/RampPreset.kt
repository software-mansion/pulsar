package com.swmansion.pulsar.kmp.androidimpl.presets.generated

import com.swmansion.pulsar.kmp.androidimpl.Pulsar
import com.swmansion.pulsar.kmp.androidimpl.presets.Player
import com.swmansion.pulsar.kmp.androidimpl.types.PatternData
import com.swmansion.pulsar.kmp.androidimpl.types.Preset
import com.swmansion.pulsar.kmp.androidimpl.types.PresetWithName

class RampPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(15.0f, 0.38f), listOf(80.0f, 0.0f), listOf(120.0f, 0.55f), listOf(190.0f, 0.0f), listOf(240.0f, 0.72f), listOf(310.0f, 0.0f), listOf(380.0f, 1.0f), listOf(520.0f, 0.2f), listOf(650.0f, 0.0f)),
            listOf(listOf(0.0f, 0.48f), listOf(380.0f, 0.78f), listOf(650.0f, 0.75f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.4f, 0.5f),
            listOf(120.0f, 0.6f, 0.6f),
            listOf(240.0f, 0.8f, 0.7f),
            listOf(380.0f, 1.0f, 0.8f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Ramp"
    }
}
