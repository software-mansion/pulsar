package com.swmansion.pulsar

internal class CoilPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(50f, 0.15f), listOf(200f, 0.2f), listOf(400f, 0.3f), listOf(570f, 0.4f), listOf(590f, 0.0f), listOf(600f, 1.0f), listOf(650f, 0.0f)),
        listOf(listOf(0f, 0.3f), listOf(570f, 0.5f), listOf(600f, 0.8f), listOf(650f, 0.8f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.2f, 0.4f),
        listOf(600f, 1.0f, 0.7f)
      ),
) {
    override val name: String = "Coil"
}
