package com.swmansion.pulsar

internal class CatPawPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(),
        listOf(),
      ),
    rawDiscretePattern = listOf(
        listOf(1f, 0.6f, 0.3f),
        listOf(75f, 0.6f, 0.08f)
      ),
) {
    override val name: String = "CatPaw"
}
