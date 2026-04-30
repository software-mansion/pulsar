package com.swmansion.pulsar.kmp.androidimpl.presets.generated

import com.swmansion.pulsar.kmp.androidimpl.Pulsar
import com.swmansion.pulsar.kmp.androidimpl.presets.Player
import com.swmansion.pulsar.kmp.androidimpl.types.PatternData
import com.swmansion.pulsar.kmp.androidimpl.types.Preset
import com.swmansion.pulsar.kmp.androidimpl.types.PresetWithName

class PassingCarPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(80.0f, 0.1f), listOf(200.0f, 0.35f), listOf(350.0f, 0.75f), listOf(450.0f, 1.0f), listOf(550.0f, 0.7f), listOf(700.0f, 0.3f), listOf(900.0f, 0.08f), listOf(1100.0f, 0.0f)),
            listOf(listOf(0.0f, 0.35f), listOf(200.0f, 0.42f), listOf(450.0f, 0.38f), listOf(700.0f, 0.3f), listOf(1100.0f, 0.22f)),
        ),
        rawDiscretePattern = listOf(

        )
    )) {
    companion object: PresetWithName {
        override val name = "PassingCar"
    }
}
