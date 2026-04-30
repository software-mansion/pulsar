package com.swmansion.pulsar.kmp

internal class StrikePreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(5f, 0.72f), listOf(40f, 0.2f), listOf(80f, 0.0f)),
        listOf(listOf(0f, 0.62f), listOf(80f, 0.6f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.75f, 0.62f)
      ),
) {
    override val name: String = "Strike"
}
