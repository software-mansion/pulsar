package com.swmansion.pulsar.kmp

internal class MurmurPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(),
        listOf(),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.6f, 0.303f),
        listOf(80f, 0.6f, 0.3f)
      ),
) {
    override val name: String = "Murmur"
}
