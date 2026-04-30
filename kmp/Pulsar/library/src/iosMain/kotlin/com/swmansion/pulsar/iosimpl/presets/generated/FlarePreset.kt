package com.swmansion.pulsar.kmp.iosimpl.presets.generated

import com.swmansion.pulsar.kmp.IOSPulsarHandle
import com.swmansion.pulsar.kmp.iosimpl.presets.IOSPlayer
internal class FlarePreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(20f, 0.18f), listOf(60f, 0.52f), listOf(90f, 0.95f), listOf(100f, 1.0f), listOf(120f, 0.75f), listOf(140f, 0.65f), listOf(200f, 0.35f), listOf(380f, 0.0f)),
        listOf(listOf(0f, 0.7f), listOf(60f, 0.82f), listOf(100f, 0.92f), listOf(200f, 0.75f), listOf(380f, 0.6f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.2f, 0.7f),
        listOf(60f, 0.55f, 0.8f),
        listOf(100f, 1.0f, 0.9f),
        listOf(140f, 0.7f, 0.85f),
        listOf(200f, 0.4f, 0.75f)
      ),
) {
    override val name: String = "Flare"
}
