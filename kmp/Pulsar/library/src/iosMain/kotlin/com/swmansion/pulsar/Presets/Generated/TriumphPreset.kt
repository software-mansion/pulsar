package com.swmansion.pulsar

internal class TriumphPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(10f, 0.4f), listOf(70f, 0.0f), listOf(120f, 0.55f), listOf(180f, 0.0f), listOf(260f, 0.7f), listOf(320f, 0.0f), listOf(420f, 0.85f), listOf(480f, 0.0f), listOf(600f, 1.0f), listOf(660f, 0.0f), listOf(750f, 1.0f), listOf(810f, 0.0f), listOf(900f, 1.0f), listOf(980f, 0.4f), listOf(1100f, 0.0f)),
        listOf(listOf(0f, 0.5f), listOf(600f, 0.75f), listOf(1100f, 0.85f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.4f, 0.55f),
        listOf(120f, 0.55f, 0.6f),
        listOf(260f, 0.7f, 0.65f),
        listOf(420f, 0.85f, 0.7f),
        listOf(600f, 1.0f, 0.8f),
        listOf(750f, 1.0f, 0.8f),
        listOf(900f, 1.0f, 0.8f)
      ),
) {
    override val name: String = "Triumph"
}
