package com.swmansion.pulsar

internal class CameraShutterPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(5f, 0.6f), listOf(30f, 0.05f), listOf(60f, 0.8f), listOf(100f, 0.1f), listOf(150f, 0.0f)),
        listOf(listOf(0f, 0.78f), listOf(30f, 0.6f), listOf(60f, 0.72f), listOf(150f, 0.65f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.6f, 0.75f),
        listOf(60f, 0.8f, 0.7f)
      ),
) {
    override val name: String = "CameraShutter"
}
