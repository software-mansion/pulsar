package com.swmansion.pulsar

internal class PendulumPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.7f), listOf(300f, 0.08f), listOf(600f, 0.5f), listOf(900f, 0.05f), listOf(1200f, 0.3f), listOf(1500f, 0.03f), listOf(1800f, 0.15f), listOf(2100f, 0.01f), listOf(2400f, 0.0f)),
        listOf(listOf(0f, 0.42f), listOf(2400f, 0.38f)),
      ),
    rawDiscretePattern = listOf(
        listOf(300f, 0.12f, 0.35f),
        listOf(900f, 0.08f, 0.35f),
        listOf(1500f, 0.05f, 0.35f),
        listOf(2100f, 0.02f, 0.35f)
      ),
) {
    override val name: String = "Pendulum"
}
