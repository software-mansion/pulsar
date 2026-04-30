package com.swmansion.pulsar.kmp.iosimpl.presets.generated

import com.swmansion.pulsar.kmp.IOSPulsarHandle
import com.swmansion.pulsar.kmp.iosimpl.presets.IOSPlayer
internal class RipplePreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(70f, 0.0f), listOf(145f, 0.5f), listOf(200f, 0.0f), listOf(265f, 0.2f), listOf(310f, 0.0f), listOf(365f, 0.07f), listOf(420f, 0.0f)),
        listOf(listOf(0f, 0.7f), listOf(140f, 0.5f), listOf(260f, 0.33f), listOf(420f, 0.18f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.858f, 0.72f),
        listOf(140f, 0.52f, 0.48f),
        listOf(260f, 0.22f, 0.32f),
        listOf(360f, 0.08f, 0.2f)
      ),
) {
    override val name: String = "Ripple"
}
