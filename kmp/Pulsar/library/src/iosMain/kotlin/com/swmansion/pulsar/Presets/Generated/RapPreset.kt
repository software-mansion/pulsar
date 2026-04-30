package com.swmansion.pulsar.kmp

internal class RapPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(),
        listOf(),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.6f, 0.5f),
        listOf(120f, 0.4f, 0.5f)
      ),
) {
    override val name: String = "Rap"
}
