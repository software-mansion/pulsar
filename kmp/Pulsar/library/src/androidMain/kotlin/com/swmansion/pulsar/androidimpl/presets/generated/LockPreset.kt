package com.swmansion.pulsar.kmp.androidimpl.presets.generated

import com.swmansion.pulsar.kmp.androidimpl.Pulsar
import com.swmansion.pulsar.kmp.androidimpl.presets.Player
import com.swmansion.pulsar.kmp.androidimpl.types.PatternData
import com.swmansion.pulsar.kmp.androidimpl.types.Preset
import com.swmansion.pulsar.kmp.androidimpl.types.PresetWithName

class LockPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(10.0f, 0.25f), listOf(100.0f, 0.15f), listOf(140.0f, 0.0f), listOf(150.0f, 0.9f), listOf(175.0f, 0.2f), listOf(220.0f, 0.0f)),
            listOf(listOf(0.0f, 0.4f), listOf(140.0f, 0.5f), listOf(150.0f, 0.75f), listOf(220.0f, 0.6f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.3f, 0.5f),
            listOf(150.0f, 0.9f, 0.7f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Lock"
    }
}
