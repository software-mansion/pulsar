package com.swmansion.pulsar.kmp

internal class ReboundPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(),
        listOf(),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 1.0f, 1.0f),
        listOf(80f, 1.0f, 0.3f)
      ),
) {
    override val name: String = "Rebound"
}
