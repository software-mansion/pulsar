package com.swmansion.pulsar

internal class FlushPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(30f, 0.22f), listOf(80f, 0.45f), listOf(100f, 0.78f), listOf(140f, 0.52f), listOf(200f, 0.2f), listOf(380f, 0.0f)),
        listOf(listOf(0f, 0.3f), listOf(100f, 0.35f), listOf(150f, 0.28f), listOf(380f, 0.22f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.25f, 0.3f),
        listOf(100f, 0.5f, 0.35f),
        listOf(150f, 0.8f, 0.3f),
        listOf(200f, 0.55f, 0.25f)
      ),
) {
    override val name: String = "Flush"
}
