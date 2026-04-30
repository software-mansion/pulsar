package com.swmansion.pulsar.kmp

internal class EngineRevPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.15f), listOf(700f, 0.75f), listOf(710f, 0.2f), listOf(720f, 0.25f), listOf(1400f, 0.95f), listOf(1600f, 0.5f), listOf(1800f, 0.0f)),
        listOf(listOf(0f, 0.08f), listOf(700f, 0.45f), listOf(720f, 0.12f), listOf(1400f, 0.55f), listOf(1800f, 0.3f)),
      ),
    rawDiscretePattern = listOf(
        listOf(700f, 0.8f, 0.4f),
        listOf(1400f, 1.0f, 0.5f)
      ),
) {
    override val name: String = "EngineRev"
}
