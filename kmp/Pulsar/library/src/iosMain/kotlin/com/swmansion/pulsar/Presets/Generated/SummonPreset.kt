package com.swmansion.pulsar

internal class SummonPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(10f, 0.8f), listOf(180f, 0.0f), listOf(300f, 0.7f), listOf(370f, 0.0f), listOf(430f, 0.7f), listOf(500f, 0.0f)),
        listOf(listOf(0f, 0.52f), listOf(180f, 0.52f), listOf(300f, 0.62f), listOf(500f, 0.62f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.8f, 0.55f),
        listOf(300f, 0.7f, 0.6f),
        listOf(430f, 0.7f, 0.6f)
      ),
) {
    override val name: String = "Summon"
}
