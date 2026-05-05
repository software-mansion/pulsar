package com.swmansion.pulsar.kmp.iosimpl.presets.generated

import com.swmansion.pulsar.kmp.IOSPulsarHandle
import com.swmansion.pulsar.kmp.iosimpl.presets.IOSPlayer
internal class FingerDrumPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(),
        listOf(),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.591f, 0.591f),
        listOf(100f, 0.588f, 0.588f),
        listOf(231f, 0.6f, 0.328f)
      ),
) {
    override val name: String = "FingerDrum"
}
