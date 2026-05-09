package com.swmansion.pulsar.kmp.iosimpl.presets.generated

import com.swmansion.pulsar.kmp.IOSPulsarHandle
import com.swmansion.pulsar.kmp.iosimpl.presets.IOSPlayer
internal class ThunderPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(100f, 0.05f), listOf(300f, 0.1f), listOf(500f, 0.2f), listOf(590f, 0.3f), listOf(600f, 1.0f), listOf(680f, 0.7f), listOf(800f, 0.5f), listOf(1000f, 0.3f), listOf(1300f, 0.15f), listOf(1700f, 0.05f), listOf(2000f, 0.0f)),
        listOf(listOf(0f, 0.1f), listOf(600f, 0.08f), listOf(2000f, 0.05f)),
      ),
    rawDiscretePattern = listOf(
        listOf(600f, 1.0f, 0.15f),
        listOf(700f, 0.8f, 0.12f),
        listOf(900f, 0.5f, 0.1f),
        listOf(1200f, 0.3f, 0.08f)
      ),
) {
    override val name: String = "Thunder"
}
