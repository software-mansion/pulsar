package com.swmansion.pulsar.kmp.iosimpl.presets.generated

import com.swmansion.pulsar.kmp.IOSPulsarHandle
import com.swmansion.pulsar.kmp.iosimpl.presets.IOSPlayer
internal class SwayPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(20f, 0.45f), listOf(250f, 0.35f), listOf(500f, 0.0f), listOf(700f, 0.0f), listOf(720f, 0.45f), listOf(950f, 0.35f), listOf(1200f, 0.0f), listOf(1400f, 0.0f), listOf(1420f, 0.45f), listOf(1650f, 0.35f), listOf(1900f, 0.0f)),
        listOf(listOf(0f, 0.22f), listOf(1900f, 0.22f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.5f, 0.25f),
        listOf(700f, 0.5f, 0.25f),
        listOf(1400f, 0.5f, 0.25f)
      ),
) {
    override val name: String = "Sway"
}
