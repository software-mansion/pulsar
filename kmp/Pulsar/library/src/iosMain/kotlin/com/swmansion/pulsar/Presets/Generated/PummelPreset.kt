package com.swmansion.pulsar

internal class PummelPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(4f, 0.9f), listOf(45f, 0.6f), listOf(70f, 0.78f), listOf(100f, 0.55f), listOf(130f, 0.92f), listOf(165f, 0.65f), listOf(190f, 0.82f), listOf(230f, 0.7f), listOf(250f, 1.0f), listOf(320f, 0.4f), listOf(450f, 0.0f)),
        listOf(listOf(0f, 0.85f), listOf(450f, 0.82f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.9f, 0.85f),
        listOf(70f, 0.75f, 0.82f),
        listOf(130f, 0.95f, 0.87f),
        listOf(190f, 0.8f, 0.83f),
        listOf(250f, 1.0f, 0.88f)
      ),
) {
    override val name: String = "Pummel"
}
