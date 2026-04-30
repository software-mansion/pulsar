package com.swmansion.pulsar.kmp.iosimpl.presets.generated

import com.swmansion.pulsar.kmp.IOSPulsarHandle
import com.swmansion.pulsar.kmp.iosimpl.presets.IOSPlayer
internal class KeyboardMembranePreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(12f, 0.33f), listOf(50f, 0.18f), listOf(100f, 0.06f), listOf(140f, 0.0f)),
        listOf(listOf(0f, 0.38f), listOf(140f, 0.35f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.35f, 0.38f)
      ),
) {
    override val name: String = "KeyboardMembrane"
}
