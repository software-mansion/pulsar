package com.swmansion.pulsar.kmp.iosimpl.presets.generated

import com.swmansion.pulsar.kmp.IOSPulsarHandle
import com.swmansion.pulsar.kmp.iosimpl.presets.IOSPlayer
internal class LockPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(10f, 0.25f), listOf(100f, 0.15f), listOf(140f, 0.0f), listOf(150f, 0.9f), listOf(175f, 0.2f), listOf(220f, 0.0f)),
        listOf(listOf(0f, 0.4f), listOf(140f, 0.5f), listOf(150f, 0.75f), listOf(220f, 0.6f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.3f, 0.5f),
        listOf(150f, 0.9f, 0.7f)
      ),
) {
    override val name: String = "Lock"
}
