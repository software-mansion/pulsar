package com.swmansion.pulsar.kmp

internal class PistonPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(),
        listOf(),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 1.0f, 0.397f),
        listOf(73f, 1.0f, 0.397f)
      ),
) {
    override val name: String = "Piston"
}
