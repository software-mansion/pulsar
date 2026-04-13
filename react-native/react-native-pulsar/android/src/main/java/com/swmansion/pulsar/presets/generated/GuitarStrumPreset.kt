package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class GuitarStrumPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(5.0f, 0.9f), listOf(60.0f, 0.65f), listOf(200.0f, 0.45f), listOf(450.0f, 0.28f), listOf(750.0f, 0.14f), listOf(1100.0f, 0.05f), listOf(1400.0f, 0.0f)),
            listOf(listOf(0.0f, 0.58f), listOf(5.0f, 0.55f), listOf(1400.0f, 0.52f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.9f, 0.55f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "GuitarStrum"
    }
}
