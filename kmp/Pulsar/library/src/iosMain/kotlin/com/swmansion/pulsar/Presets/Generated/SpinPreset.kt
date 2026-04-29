package com.swmansion.pulsar

internal class SpinPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(8f, 0.38f), listOf(60f, 0.0f), listOf(250f, 0.38f), listOf(308f, 0.0f), listOf(500f, 0.38f), listOf(558f, 0.0f), listOf(750f, 0.38f), listOf(808f, 0.0f), listOf(1000f, 0.38f), listOf(1058f, 0.0f), listOf(1250f, 0.38f), listOf(1308f, 0.0f), listOf(1500f, 0.38f), listOf(1558f, 0.0f), listOf(1750f, 0.38f), listOf(1808f, 0.0f)),
        listOf(listOf(0f, 0.55f), listOf(1808f, 0.55f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.4f, 0.55f),
        listOf(250f, 0.4f, 0.55f),
        listOf(500f, 0.4f, 0.55f),
        listOf(750f, 0.4f, 0.55f),
        listOf(1000f, 0.4f, 0.55f),
        listOf(1250f, 0.4f, 0.55f),
        listOf(1500f, 0.4f, 0.55f),
        listOf(1750f, 0.4f, 0.55f)
      ),
) {
    override val name: String = "Spin"
}
