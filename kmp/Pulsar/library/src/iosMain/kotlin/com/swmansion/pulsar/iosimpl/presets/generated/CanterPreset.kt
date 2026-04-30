package com.swmansion.pulsar.kmp

internal class CanterPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(),
        listOf(),
      ),
    rawDiscretePattern = listOf(
        listOf(1f, 1.0f, 0.203f),
        listOf(77f, 0.697f, 0.5f),
        listOf(173f, 0.703f, 0.244f)
      ),
) {
    override val name: String = "Canter"
}
