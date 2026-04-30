package com.swmansion.pulsar.kmp.androidimpl.presets.generated

import com.swmansion.pulsar.kmp.androidimpl.Pulsar
import com.swmansion.pulsar.kmp.androidimpl.presets.Player
import com.swmansion.pulsar.kmp.androidimpl.types.PatternData
import com.swmansion.pulsar.kmp.androidimpl.types.Preset
import com.swmansion.pulsar.kmp.androidimpl.types.PresetWithName

class PropelPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(8.0f, 0.55f), listOf(70.0f, 0.2f), listOf(120.0f, 0.88f), listOf(200.0f, 0.2f), listOf(300.0f, 0.0f)),
            listOf(listOf(0.0f, 0.56f), listOf(120.0f, 0.72f), listOf(300.0f, 0.65f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.6f, 0.58f),
            listOf(120.0f, 0.9f, 0.72f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Propel"
    }
}
