package com.swmansion.pulsar.kmp

internal class UnfurlPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(5f, 0.5f), listOf(68f, 0.0f), listOf(93f, 0.62f), listOf(158f, 0.0f), listOf(183f, 0.74f), listOf(248f, 0.0f), listOf(273f, 0.86f), listOf(338f, 0.0f), listOf(363f, 1.0f), listOf(850f, 0.6f), listOf(1050f, 0.2f), listOf(1180f, 0.0f)),
        listOf(listOf(0f, 0.28f), listOf(90f, 0.4f), listOf(180f, 0.49f), listOf(270f, 0.62f), listOf(360f, 0.7f), listOf(1180f, 0.7f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.5f, 0.28f),
        listOf(90f, 0.62f, 0.4f),
        listOf(180f, 0.74f, 0.49f),
        listOf(270f, 0.86f, 0.62f),
        listOf(360f, 1.0f, 0.7f)
      ),
) {
    override val name: String = "Unfurl"
}
