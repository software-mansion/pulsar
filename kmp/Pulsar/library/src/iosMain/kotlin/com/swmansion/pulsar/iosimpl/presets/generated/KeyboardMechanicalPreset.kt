package com.swmansion.pulsar.kmp

internal class KeyboardMechanicalPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(4f, 0.52f), listOf(18f, 0.2f), listOf(22f, 0.7f), listOf(38f, 0.15f), listOf(55f, 0.0f)),
        listOf(listOf(0f, 0.68f), listOf(22f, 0.76f), listOf(55f, 0.7f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.55f, 0.68f),
        listOf(22f, 0.72f, 0.74f)
      ),
) {
    override val name: String = "KeyboardMechanical"
}
