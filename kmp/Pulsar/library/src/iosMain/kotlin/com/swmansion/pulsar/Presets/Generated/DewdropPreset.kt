package com.swmansion.pulsar.kmp

internal class DewdropPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(8f, 0.4f), listOf(65f, 0.0f), listOf(130f, 0.6f), listOf(210f, 0.0f)),
        listOf(listOf(0f, 0.5f), listOf(130f, 0.65f), listOf(210f, 0.62f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.4f, 0.52f),
        listOf(130f, 0.6f, 0.65f)
      ),
) {
    override val name: String = "Dewdrop"
}
