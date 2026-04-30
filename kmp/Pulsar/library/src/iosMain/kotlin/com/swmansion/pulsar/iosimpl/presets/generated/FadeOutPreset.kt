package com.swmansion.pulsar.kmp

internal class FadeOutPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(),
        listOf(),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 1.0f, 1.0f),
        listOf(86f, 0.8f, 0.8f),
        listOf(192f, 0.603f, 0.603f),
        listOf(298f, 0.406f, 0.406f),
        listOf(408f, 0.291f, 0.209f),
        listOf(506f, 0.297f, 0.075f)
      ),
) {
    override val name: String = "FadeOut"
}
