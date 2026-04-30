package com.swmansion.pulsar.kmp

internal class BurstPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(15f, 0.18f), listOf(80f, 0.4f), listOf(100f, 0.85f), listOf(130f, 0.3f), listOf(300f, 0.0f)),
        listOf(listOf(0f, 0.55f), listOf(80f, 0.65f), listOf(100f, 0.72f), listOf(300f, 0.4f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.2f, 0.55f),
        listOf(100f, 0.45f, 0.65f),
        listOf(180f, 0.9f, 0.7f)
      ),
) {
    override val name: String = "Burst"
}
