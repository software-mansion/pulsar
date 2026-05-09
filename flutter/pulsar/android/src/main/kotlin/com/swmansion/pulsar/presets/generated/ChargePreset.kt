package com.swmansion.pulsar.presets.generated

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.Player
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class ChargePreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(8.0f, 0.62f), listOf(100.0f, 0.35f), listOf(200.0f, 0.0f), listOf(900.0f, 0.0f), listOf(905.0f, 0.85f), listOf(980.0f, 0.5f), listOf(1100.0f, 0.35f), listOf(1250.0f, 0.0f), listOf(1600.0f, 0.0f), listOf(1603.0f, 1.0f), listOf(1770.0f, 1.0f), listOf(1873.0f, 0.334f), listOf(2046.0f, 0.0f)),
            listOf(listOf(0.0f, 0.62f), listOf(200.0f, 0.6f), listOf(900.0f, 0.68f), listOf(1250.0f, 0.65f), listOf(1600.0f, 0.82f), listOf(1680.0f, 0.7f), listOf(1860.0f, 0.6f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.65f, 0.62f),
            listOf(900.0f, 0.85f, 0.68f),
            listOf(1600.0f, 1.0f, 0.82f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Charge"
    }
}
