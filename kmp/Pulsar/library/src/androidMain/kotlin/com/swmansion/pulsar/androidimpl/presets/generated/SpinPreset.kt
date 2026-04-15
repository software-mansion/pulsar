package com.swmansion.pulsar.androidimpl.presets.generated

import com.swmansion.pulsar.androidimpl.Pulsar
import com.swmansion.pulsar.androidimpl.presets.Player
import com.swmansion.pulsar.androidimpl.types.PatternData
import com.swmansion.pulsar.androidimpl.types.Preset
import com.swmansion.pulsar.androidimpl.types.PresetWithName

class SpinPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(8.0f, 0.38f), listOf(60.0f, 0.0f), listOf(250.0f, 0.38f), listOf(308.0f, 0.0f), listOf(500.0f, 0.38f), listOf(558.0f, 0.0f), listOf(750.0f, 0.38f), listOf(808.0f, 0.0f), listOf(1000.0f, 0.38f), listOf(1058.0f, 0.0f), listOf(1250.0f, 0.38f), listOf(1308.0f, 0.0f), listOf(1500.0f, 0.38f), listOf(1558.0f, 0.0f), listOf(1750.0f, 0.38f), listOf(1808.0f, 0.0f)),
            listOf(listOf(0.0f, 0.55f), listOf(1808.0f, 0.55f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.4f, 0.55f),
            listOf(250.0f, 0.4f, 0.55f),
            listOf(500.0f, 0.4f, 0.55f),
            listOf(750.0f, 0.4f, 0.55f),
            listOf(1000.0f, 0.4f, 0.55f),
            listOf(1250.0f, 0.4f, 0.55f),
            listOf(1500.0f, 0.4f, 0.55f),
            listOf(1750.0f, 0.4f, 0.55f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Spin"
    }
}
