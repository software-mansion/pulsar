package com.swmansion.pulsar.kmp

internal class FlourishPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(50f, 0.2f), listOf(200f, 0.65f), listOf(380f, 0.95f), listOf(480f, 0.5f), listOf(650f, 0.0f)),
        listOf(listOf(0f, 0.43f), listOf(380f, 0.78f), listOf(650f, 0.65f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.25f, 0.45f),
        listOf(200f, 0.7f, 0.65f),
        listOf(380f, 0.95f, 0.78f),
        listOf(500f, 0.6f, 0.62f),
        listOf(584f, 0.628f, 0.628f),
        listOf(682f, 0.6f, 0.6f),
        listOf(754f, 0.456f, 0.456f),
        listOf(827f, 0.303f, 0.303f),
        listOf(917f, 0.2f, 0.2f)
      ),
) {
    override val name: String = "Flourish"
}
