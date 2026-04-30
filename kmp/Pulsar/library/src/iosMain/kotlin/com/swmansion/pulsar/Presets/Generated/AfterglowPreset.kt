package com.swmansion.pulsar.kmp

internal class AfterglowPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(),
        listOf(),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 1.0f, 0.3f),
        listOf(75f, 0.703f, 0.203f),
        listOf(150f, 0.5f, 0.1f)
      ),
) {
    override val name: String = "Afterglow"
}
