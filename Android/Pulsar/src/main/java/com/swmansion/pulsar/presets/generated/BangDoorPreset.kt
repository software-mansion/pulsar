package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class BangDoorPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(8.0f, 0.75f), listOf(90.0f, 0.05f), listOf(180.0f, 0.0f), listOf(220.0f, 0.8f), listOf(310.0f, 0.05f), listOf(380.0f, 0.0f), listOf(420.0f, 0.88f), listOf(508.0f, 0.05f), listOf(550.0f, 0.0f), listOf(590.0f, 0.92f), listOf(678.0f, 0.05f), listOf(710.0f, 0.0f), listOf(740.0f, 1.0f), listOf(816.0f, 0.05f), listOf(840.0f, 0.0f), listOf(870.0f, 1.0f), listOf(950.0f, 0.05f), listOf(1050.0f, 0.0f)),
            listOf(listOf(0.0f, 0.28f), listOf(1050.0f, 0.28f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.75f, 0.3f),
            listOf(220.0f, 0.8f, 0.32f),
            listOf(420.0f, 0.88f, 0.3f),
            listOf(590.0f, 0.92f, 0.32f),
            listOf(740.0f, 1.0f, 0.3f),
            listOf(870.0f, 1.0f, 0.3f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "BangDoor"
    }
}
