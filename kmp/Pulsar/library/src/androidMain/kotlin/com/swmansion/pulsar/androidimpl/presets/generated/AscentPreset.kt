package com.swmansion.pulsar.kmp.androidimpl.presets.generated

import com.swmansion.pulsar.kmp.androidimpl.Pulsar
import com.swmansion.pulsar.kmp.androidimpl.presets.Player
import com.swmansion.pulsar.kmp.androidimpl.types.PatternData
import com.swmansion.pulsar.kmp.androidimpl.types.Preset
import com.swmansion.pulsar.kmp.androidimpl.types.PresetWithName

class AscentPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0.0f, 0.0f), listOf(5.0f, 0.55f), listOf(155.0f, 0.0f), listOf(205.0f, 0.65f), listOf(335.0f, 0.0f), listOf(385.0f, 0.75f), listOf(495.0f, 0.0f), listOf(545.0f, 0.85f), listOf(635.0f, 0.0f), listOf(685.0f, 0.92f), listOf(755.0f, 0.0f), listOf(805.0f, 0.97f), listOf(860.0f, 0.0f), listOf(905.0f, 1.0f), listOf(1700.0f, 0.65f), listOf(2100.0f, 0.25f), listOf(2400.0f, 0.0f)),
            listOf(listOf(0.0f, 0.3f), listOf(200.0f, 0.37f), listOf(380.0f, 0.42f), listOf(540.0f, 0.55f), listOf(680.0f, 0.65f), listOf(800.0f, 0.73f), listOf(900.0f, 0.87f), listOf(2400.0f, 0.87f)),
        ),
        rawDiscretePattern = listOf(
            listOf(0.0f, 0.55f, 0.3f),
            listOf(200.0f, 0.65f, 0.37f),
            listOf(380.0f, 0.75f, 0.42f),
            listOf(540.0f, 0.85f, 0.55f),
            listOf(680.0f, 0.92f, 0.65f),
            listOf(800.0f, 0.97f, 0.73f),
            listOf(900.0f, 1.0f, 0.87f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Ascent"
    }
}
