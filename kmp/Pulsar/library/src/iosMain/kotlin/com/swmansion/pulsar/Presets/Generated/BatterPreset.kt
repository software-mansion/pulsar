package com.swmansion.pulsar

internal class BatterPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(5f, 0.9f), listOf(45f, 0.35f), listOf(60f, 0.8f), listOf(102f, 0.32f), listOf(120f, 0.93f), listOf(158f, 0.35f), listOf(175f, 0.83f), listOf(208f, 0.38f), listOf(225f, 1.0f), listOf(380f, 0.0f)),
        listOf(listOf(0f, 0.35f), listOf(225f, 0.38f), listOf(380f, 0.32f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.9f, 0.35f),
        listOf(60f, 0.82f, 0.32f),
        listOf(120f, 0.95f, 0.36f),
        listOf(175f, 0.85f, 0.33f),
        listOf(225f, 1.0f, 0.38f)
      ),
) {
    override val name: String = "Batter"
}
