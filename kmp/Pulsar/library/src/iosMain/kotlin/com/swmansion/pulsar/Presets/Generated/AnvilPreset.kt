package com.swmansion.pulsar.kmp

internal class AnvilPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(5f, 1.0f), listOf(60f, 0.6f), listOf(150f, 0.3f), listOf(300f, 0.1f), listOf(500f, 0.0f)),
        listOf(listOf(0f, 0.12f), listOf(5f, 0.1f), listOf(500f, 0.08f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 1.0f, 0.15f),
        listOf(80f, 0.5f, 0.2f)
      ),
) {
    override val name: String = "Anvil"
}
