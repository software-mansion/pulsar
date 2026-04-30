package com.swmansion.pulsar.kmp

internal class GlitchPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.9f), listOf(20f, 0.1f), listOf(55f, 1.0f), listOf(65f, 0.0f), listOf(100f, 0.85f), listOf(118f, 0.0f), listOf(160f, 0.95f), listOf(175f, 0.15f), listOf(220f, 0.0f)),
        listOf(listOf(0f, 0.9f), listOf(20f, 0.2f), listOf(55f, 1.0f), listOf(65f, 0.1f), listOf(100f, 0.88f), listOf(118f, 0.15f), listOf(160f, 0.92f), listOf(220f, 0.3f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.9f, 0.9f),
        listOf(30f, 0.2f, 0.3f),
        listOf(55f, 1.0f, 0.95f),
        listOf(70f, 0.1f, 0.2f),
        listOf(100f, 0.85f, 0.85f),
        listOf(130f, 0.05f, 0.1f),
        listOf(160f, 0.95f, 0.9f),
        listOf(185f, 0.3f, 0.4f)
      ),
) {
    override val name: String = "Glitch"
}
