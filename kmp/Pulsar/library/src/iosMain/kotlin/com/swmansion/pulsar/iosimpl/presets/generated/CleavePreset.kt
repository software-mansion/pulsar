package com.swmansion.pulsar.kmp.iosimpl.presets.generated

import com.swmansion.pulsar.kmp.IOSPulsarHandle
import com.swmansion.pulsar.kmp.iosimpl.presets.IOSPlayer
internal class CleavePreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(5f, 0.85f), listOf(65f, 0.0f), listOf(100f, 0.7f), listOf(165f, 0.2f), listOf(250f, 0.0f)),
        listOf(listOf(0f, 0.8f), listOf(250f, 0.76f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.85f, 0.8f),
        listOf(100f, 0.7f, 0.78f)
      ),
) {
    override val name: String = "Cleave"
}
