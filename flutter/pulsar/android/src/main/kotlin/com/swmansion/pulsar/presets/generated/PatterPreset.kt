package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class PatterPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(),
            listOf(),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.603f, 0.2f),
            listOf(82.0f, 0.606f, 0.197f),
            listOf(179.0f, 0.609f, 0.594f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Patter"
    }
}
