package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class AimingFirePreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(4.0f, 1.0f), listOf(55.0f, 0.35f), listOf(80.0f, 0.5f), listOf(140.0f, 0.2f), listOf(200.0f, 0.25f), listOf(280.0f, 0.0f)),
            listOf(listOf(0.0f, 0.72f), listOf(80.0f, 0.55f), listOf(280.0f, 0.42f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 1.0f, 0.7f),
            listOf(80.0f, 0.5f, 0.55f),
            listOf(200.0f, 0.25f, 0.45f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "AimingFire"
    }
}
