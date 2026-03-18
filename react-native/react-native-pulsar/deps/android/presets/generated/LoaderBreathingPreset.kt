package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class LoaderBreathingPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(1500.0f, 0.4f), listOf(3000.0f, 0.0f), listOf(4500.0f, 0.4f), listOf(6000.0f, 0.0f)),
            listOf(listOf(0.0f, 0.15f), listOf(6000.0f, 0.15f)),
        ),
        rawDiscretePattern = listOf(

        )
    )) {
    companion object: PresetWithName {
        override val name = "LoaderBreathing"
    }
}
