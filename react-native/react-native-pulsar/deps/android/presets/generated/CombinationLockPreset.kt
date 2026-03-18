package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class CombinationLockPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(4.0f, 0.62f), listOf(25.0f, 0.0f), listOf(180.0f, 0.6f), listOf(201.0f, 0.0f), listOf(360.0f, 0.63f), listOf(381.0f, 0.0f), listOf(540.0f, 0.6f), listOf(561.0f, 0.0f), listOf(720.0f, 0.62f), listOf(741.0f, 0.0f), listOf(900.0f, 0.9f), listOf(935.0f, 0.2f), listOf(980.0f, 0.0f)),
            listOf(listOf(0.0f, 0.75f), listOf(900.0f, 0.75f), listOf(980.0f, 0.7f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.62f, 0.75f),
            listOf(180.0f, 0.6f, 0.75f),
            listOf(360.0f, 0.63f, 0.75f),
            listOf(540.0f, 0.6f, 0.75f),
            listOf(720.0f, 0.62f, 0.75f),
            listOf(900.0f, 0.9f, 0.72f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "CombinationLock"
    }
}
