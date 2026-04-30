package com.swmansion.pulsar.kmp

internal class BassDropPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(),
        listOf(),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 1.0f, 0.509f),
        listOf(71f, 1.0f, 0.069f)
      ),
) {
    override val name: String = "BassDrop"
}
