package com.swmansion.pulsar.kmp.iosimpl.presets.generated

import com.swmansion.pulsar.kmp.IOSPulsarHandle
import com.swmansion.pulsar.kmp.iosimpl.presets.IOSPlayer
internal class ExplosionPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(5f, 1.0f), listOf(80f, 0.7f), listOf(200f, 0.5f), listOf(400f, 0.3f), listOf(700f, 0.1f), listOf(1000f, 0.0f)),
        listOf(listOf(0f, 0.2f), listOf(5f, 0.15f), listOf(1000f, 0.05f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 1.0f, 0.4f),
        listOf(50f, 0.8f, 0.328f),
        listOf(120f, 0.722f, 0.256f),
        listOf(187f, 0.594f, 0.138f)
      ),
) {
    override val name: String = "Explosion"
}
