package com.swmansion.pulsar.androidimpl.presets.generated

import com.swmansion.pulsar.androidimpl.Pulsar
import com.swmansion.pulsar.androidimpl.presets.Player
import com.swmansion.pulsar.androidimpl.types.PatternData
import com.swmansion.pulsar.androidimpl.types.Preset
import com.swmansion.pulsar.androidimpl.types.PresetWithName

class DewdropPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(8.0f, 0.4f), listOf(65.0f, 0.0f), listOf(130.0f, 0.6f), listOf(210.0f, 0.0f)),
            listOf(listOf(0.0f, 0.5f), listOf(130.0f, 0.65f), listOf(210.0f, 0.62f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.4f, 0.52f),
            listOf(130.0f, 0.6f, 0.65f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Dewdrop"
    }
}
