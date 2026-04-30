package com.swmansion.pulsar.kmp

internal class WispPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(8f, 0.22f), listOf(60f, 0.0f)),
        listOf(listOf(0f, 0.48f), listOf(60f, 0.48f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.25f, 0.48f)
      ),
) {
    override val name: String = "Wisp"
}
