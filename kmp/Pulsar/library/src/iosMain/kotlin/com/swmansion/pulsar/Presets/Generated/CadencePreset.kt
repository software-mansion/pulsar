package com.swmansion.pulsar.kmp

internal class CadencePreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(),
        listOf(),
      ),
    rawDiscretePattern = listOf(
        listOf(1f, 0.809f, 0.897f),
        listOf(199f, 1.0f, 0.413f)
      ),
) {
    override val name: String = "Cadence"
}
