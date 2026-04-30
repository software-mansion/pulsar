package com.swmansion.pulsar.kmp.androidimpl.presets.generated

import com.swmansion.pulsar.kmp.androidimpl.Pulsar
import com.swmansion.pulsar.kmp.androidimpl.presets.Player
import com.swmansion.pulsar.kmp.androidimpl.types.PatternData
import com.swmansion.pulsar.kmp.androidimpl.types.Preset
import com.swmansion.pulsar.kmp.androidimpl.types.PresetWithName

class CoinDropPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(5.0f, 0.5f), listOf(35.0f, 0.0f), listOf(120.0f, 0.7f), listOf(145.0f, 0.0f), listOf(210.0f, 0.4f), listOf(230.0f, 0.0f), listOf(300.0f, 0.8f), listOf(325.0f, 0.0f), listOf(380.0f, 0.35f), listOf(397.0f, 0.0f), listOf(460.0f, 0.6f), listOf(480.0f, 0.0f), listOf(520.0f, 0.9f), listOf(550.0f, 0.0f), listOf(590.0f, 0.45f), listOf(608.0f, 0.0f), listOf(650.0f, 0.7f), listOf(675.0f, 0.0f)),
            listOf(listOf(0.0f, 0.8f), listOf(675.0f, 0.9f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.5f, 0.8f),
            listOf(120.0f, 0.7f, 0.85f),
            listOf(210.0f, 0.4f, 0.75f),
            listOf(300.0f, 0.8f, 0.9f),
            listOf(380.0f, 0.35f, 0.7f),
            listOf(460.0f, 0.6f, 0.8f),
            listOf(520.0f, 0.9f, 0.9f),
            listOf(590.0f, 0.45f, 0.75f),
            listOf(650.0f, 0.7f, 0.85f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "CoinDrop"
    }
}
