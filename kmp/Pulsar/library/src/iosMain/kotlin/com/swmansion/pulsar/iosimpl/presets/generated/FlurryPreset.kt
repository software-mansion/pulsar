package com.swmansion.pulsar.kmp

internal class FlurryPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(5f, 0.45f), listOf(40f, 0.0f), listOf(60f, 0.55f), listOf(95f, 0.0f), listOf(115f, 0.65f), listOf(148f, 0.0f), listOf(165f, 0.82f), listOf(240f, 0.1f), listOf(300f, 0.0f)),
        listOf(listOf(0f, 0.55f), listOf(165f, 0.72f), listOf(300f, 0.7f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.5f, 0.55f),
        listOf(60f, 0.6f, 0.6f),
        listOf(115f, 0.7f, 0.65f),
        listOf(165f, 0.85f, 0.7f)
      ),
) {
    override val name: String = "Flurry"
}
