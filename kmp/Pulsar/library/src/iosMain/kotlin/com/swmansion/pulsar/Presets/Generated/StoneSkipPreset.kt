package com.swmansion.pulsar.kmp

internal class StoneSkipPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(),
        listOf(),
      ),
    rawDiscretePattern = listOf(
        listOf(1f, 0.706f, 0.706f),
        listOf(77f, 0.697f, 0.5f),
        listOf(181f, 0.703f, 0.244f)
      ),
) {
    override val name: String = "StoneSkip"
}
