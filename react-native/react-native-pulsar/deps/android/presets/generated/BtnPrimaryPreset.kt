package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class BtnPrimaryPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(5.0f, 0.72f), listOf(40.0f, 0.2f), listOf(80.0f, 0.0f)),
            listOf(listOf(0.0f, 0.62f), listOf(80.0f, 0.6f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.75f, 0.62f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "BtnPrimary"
    }
}
