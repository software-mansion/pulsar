package com.swmansion.pulsar.kmp

internal class BoulderPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(),
        listOf(),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 1.0f, 0.2f)
      ),
) {
    override val name: String = "Boulder"
}
