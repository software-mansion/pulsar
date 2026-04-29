package com.swmansion.pulsar

internal class BuildupPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(),
        listOf(),
      ),
    rawDiscretePattern = listOf(
        listOf(1f, 0.994f, 0.053f),
        listOf(51f, 0.994f, 0.122f),
        listOf(100f, 0.991f, 0.228f),
        listOf(156f, 1.0f, 0.394f),
        listOf(208f, 0.991f, 0.613f),
        listOf(260f, 1.0f, 0.803f),
        listOf(309f, 1.0f, 1.0f)
      ),
) {
    override val name: String = "Buildup"
}
