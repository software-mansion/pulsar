package com.swmansion.pulsar.kmp

internal class LighthousePreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(15f, 0.4f), listOf(150f, 0.4f), listOf(250f, 0.0f), listOf(400f, 0.0f), listOf(415f, 0.4f), listOf(550f, 0.4f), listOf(650f, 0.0f), listOf(800f, 0.0f), listOf(815f, 0.4f), listOf(950f, 0.4f), listOf(1050f, 0.0f)),
        listOf(listOf(0f, 0.5f), listOf(1050f, 0.5f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.45f, 0.5f),
        listOf(400f, 0.45f, 0.5f),
        listOf(800f, 0.45f, 0.5f)
      ),
) {
    override val name: String = "Lighthouse"
}
