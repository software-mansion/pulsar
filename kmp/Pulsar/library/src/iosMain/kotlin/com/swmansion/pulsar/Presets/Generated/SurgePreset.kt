package com.swmansion.pulsar.kmp

internal class SurgePreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(8f, 0.45f), listOf(60f, 0.1f), listOf(75f, 0.58f), listOf(130f, 0.12f), listOf(145f, 0.7f), listOf(195f, 0.15f), listOf(210f, 0.8f), listOf(330f, 0.0f)),
        listOf(listOf(0f, 0.82f), listOf(210f, 0.93f), listOf(330f, 0.9f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.5f, 0.82f),
        listOf(75f, 0.62f, 0.86f),
        listOf(145f, 0.74f, 0.9f),
        listOf(210f, 0.8f, 0.92f)
      ),
) {
    override val name: String = "Surge"
}
