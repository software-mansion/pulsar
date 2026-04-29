package com.swmansion.pulsar

internal class KnockPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(8f, 0.65f), listOf(70f, 0.08f), listOf(200f, 0.0f), listOf(280f, 0.65f), listOf(348f, 0.08f), listOf(480f, 0.0f), listOf(560f, 0.65f), listOf(628f, 0.08f), listOf(760f, 0.0f)),
        listOf(listOf(0f, 0.32f), listOf(760f, 0.32f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.65f, 0.35f),
        listOf(280f, 0.65f, 0.35f),
        listOf(560f, 0.65f, 0.35f)
      ),
) {
    override val name: String = "Knock"
}
