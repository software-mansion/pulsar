package com.swmansion.pulsar

internal class DronePreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(20f, 0.28f), listOf(180f, 0.28f), listOf(280f, 0.0f), listOf(500f, 0.0f), listOf(520f, 0.28f), listOf(680f, 0.28f), listOf(780f, 0.0f), listOf(1000f, 0.0f), listOf(1020f, 0.28f), listOf(1180f, 0.28f), listOf(1280f, 0.0f), listOf(1500f, 0.0f), listOf(1520f, 0.28f), listOf(1680f, 0.28f), listOf(1780f, 0.0f)),
        listOf(listOf(0f, 0.45f), listOf(1780f, 0.45f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.3f, 0.45f),
        listOf(500f, 0.3f, 0.45f),
        listOf(1000f, 0.3f, 0.45f),
        listOf(1500f, 0.3f, 0.45f)
      ),
) {
    override val name: String = "Drone"
}
