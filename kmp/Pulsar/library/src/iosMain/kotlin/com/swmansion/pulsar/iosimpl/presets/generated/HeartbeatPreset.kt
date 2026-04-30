package com.swmansion.pulsar.kmp

internal class HeartbeatPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(10f, 0.8f), listOf(80f, 0.0f), listOf(120f, 0.5f), listOf(200f, 0.0f), listOf(800f, 0.0f), listOf(810f, 0.8f), listOf(880f, 0.0f), listOf(920f, 0.5f), listOf(1000f, 0.0f)),
        listOf(listOf(0f, 0.2f), listOf(1000f, 0.2f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.9f, 0.2f),
        listOf(120f, 0.6f, 0.2f),
        listOf(800f, 0.9f, 0.2f),
        listOf(920f, 0.6f, 0.2f)
      ),
) {
    override val name: String = "Heartbeat"
}
