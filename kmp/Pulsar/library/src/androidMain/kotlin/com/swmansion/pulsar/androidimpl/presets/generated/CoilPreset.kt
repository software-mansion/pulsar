package com.swmansion.pulsar.androidimpl.presets.generated

import com.swmansion.pulsar.androidimpl.Pulsar
import com.swmansion.pulsar.androidimpl.presets.Player
import com.swmansion.pulsar.androidimpl.types.PatternData
import com.swmansion.pulsar.androidimpl.types.Preset
import com.swmansion.pulsar.androidimpl.types.PresetWithName

class CoilPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(50.0f, 0.15f), listOf(200.0f, 0.2f), listOf(400.0f, 0.3f), listOf(570.0f, 0.4f), listOf(590.0f, 0.0f), listOf(600.0f, 1.0f), listOf(650.0f, 0.0f)),
            listOf(listOf(0.0f, 0.3f), listOf(570.0f, 0.5f), listOf(600.0f, 0.8f), listOf(650.0f, 0.8f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.2f, 0.4f),
            listOf(600.0f, 1.0f, 0.7f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Coil"
    }
}
