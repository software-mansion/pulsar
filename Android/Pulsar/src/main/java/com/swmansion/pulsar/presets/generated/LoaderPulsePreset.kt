package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class LoaderPulsePreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(300.0f, 0.3f), listOf(700.0f, 0.3f), listOf(1000.0f, 0.0f), listOf(1300.0f, 0.3f), listOf(1700.0f, 0.3f), listOf(2000.0f, 0.0f)),
            listOf(listOf(0.0f, 0.4f), listOf(2000.0f, 0.4f)),
        ),
        rawDiscretePattern = listOf(

        )
    )) {
    companion object: PresetWithName {
        override val name = "LoaderPulse"
    }
}
