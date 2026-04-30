package com.swmansion.pulsar.kmp

internal class ShockwavePreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(5f, 1.0f), listOf(50f, 0.7f), listOf(120f, 0.45f), listOf(200f, 0.3f), listOf(320f, 0.15f), listOf(450f, 0.08f), listOf(600f, 0.03f), listOf(800f, 0.0f)),
        listOf(listOf(0f, 0.4f), listOf(5f, 0.3f), listOf(800f, 0.2f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 1.0f, 0.35f),
        listOf(200f, 0.4f, 0.3f),
        listOf(450f, 0.15f, 0.25f)
      ),
) {
    override val name: String = "Shockwave"
}
