package com.swmansion.pulsar.androidimpl.presets.generated

import com.swmansion.pulsar.androidimpl.Pulsar
import com.swmansion.pulsar.androidimpl.presets.Player
import com.swmansion.pulsar.androidimpl.types.PatternData
import com.swmansion.pulsar.androidimpl.types.Preset
import com.swmansion.pulsar.androidimpl.types.PresetWithName

class GallopPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(),
            listOf(),
        ),
        rawDiscretePattern = listOf(
            listOf(10.0f, 1.0f, 0.603f),
            listOf(155.0f, 1.0f, 0.163f),
            listOf(601.0f, 0.997f, 0.609f),
            listOf(750.0f, 1.0f, 0.153f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Gallop"
    }
}
