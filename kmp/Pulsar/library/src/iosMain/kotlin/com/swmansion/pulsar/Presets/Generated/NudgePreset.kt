package com.swmansion.pulsar

internal class NudgePreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(10f, 0.6f), listOf(60f, 0.0f), listOf(120f, 0.4f), listOf(180f, 0.0f)),
        listOf(listOf(0f, 0.5f), listOf(180f, 0.5f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.6f, 0.5f),
        listOf(120f, 0.4f, 0.5f)
      ),
) {
    override val name: String = "Nudge"
}
