package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class CascadePreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(),
            listOf(),
        ),
        rawDiscretePattern = listOf(
            listOf(1.0f, 0.994f, 0.994f),
            listOf(99.0f, 0.997f, 0.997f),
            listOf(199.0f, 0.997f, 0.997f),
            listOf(551.0f, 0.8f, 0.8f),
            listOf(649.0f, 0.803f, 0.803f),
            listOf(751.0f, 0.797f, 0.797f),
            listOf(1118.0f, 0.5f, 0.5f),
            listOf(1219.0f, 0.491f, 0.491f),
            listOf(1318.0f, 0.494f, 0.494f),
            listOf(1660.0f, 0.497f, 0.213f),
            listOf(1762.0f, 0.506f, 0.209f),
            listOf(1863.0f, 0.488f, 0.213f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Cascade"
    }
}
