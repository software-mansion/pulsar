package com.swmansion.pulsar.kmp

internal class ThunderRollPreset(
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
        listOf(309f, 1.0f, 1.0f),
        listOf(368f, 1.0f, 1.0f),
        listOf(420f, 0.8f, 0.8f),
        listOf(482f, 0.606f, 0.606f),
        listOf(544f, 0.394f, 0.394f),
        listOf(605f, 0.194f, 0.194f),
        listOf(670f, 0.091f, 0.091f)
      ),
) {
    override val name: String = "ThunderRoll"
}
