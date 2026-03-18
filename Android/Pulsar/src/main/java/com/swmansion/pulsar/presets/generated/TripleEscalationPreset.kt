package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class TripleEscalationPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(),
            listOf(),
        ),
        rawDiscretePattern = listOf(
            listOf(1.0f, 1.0f, 0.203f),
            listOf(77.0f, 0.697f, 0.5f),
            listOf(173.0f, 1.0f, 0.703f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "TripleEscalation"
    }
}
