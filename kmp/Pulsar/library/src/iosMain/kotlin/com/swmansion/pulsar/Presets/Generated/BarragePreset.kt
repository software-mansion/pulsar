package com.swmansion.pulsar

internal class BarragePreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(),
        listOf(),
      ),
    rawDiscretePattern = listOf(
        listOf(1f, 0.994f, 0.994f),
        listOf(51f, 0.994f, 0.994f),
        listOf(100f, 0.991f, 0.991f),
        listOf(156f, 1.0f, 1.0f),
        listOf(208f, 0.991f, 0.991f),
        listOf(260f, 1.0f, 1.0f),
        listOf(309f, 1.0f, 1.0f)
      ),
) {
    override val name: String = "Barrage"
}
