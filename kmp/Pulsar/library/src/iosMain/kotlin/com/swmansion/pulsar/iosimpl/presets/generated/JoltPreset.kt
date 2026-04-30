package com.swmansion.pulsar.kmp

internal class JoltPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(),
        listOf(),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 1.0f, 1.0f)
      ),
) {
    override val name: String = "Jolt"
}
