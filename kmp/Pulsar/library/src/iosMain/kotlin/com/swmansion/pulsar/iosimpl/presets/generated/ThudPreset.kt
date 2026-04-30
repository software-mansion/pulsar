package com.swmansion.pulsar.kmp

internal class ThudPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(15f, 0.45f), listOf(80f, 0.35f), listOf(160f, 0.0f)),
        listOf(listOf(0f, 0.42f), listOf(160f, 0.4f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.5f, 0.42f)
      ),
) {
    override val name: String = "Thud"
}
