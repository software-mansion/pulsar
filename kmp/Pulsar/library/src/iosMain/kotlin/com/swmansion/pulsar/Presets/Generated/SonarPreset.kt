package com.swmansion.pulsar

internal class SonarPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(8f, 0.35f), listOf(130f, 0.04f), listOf(500f, 0.0f), listOf(600f, 0.35f), listOf(730f, 0.04f), listOf(1100f, 0.0f), listOf(1200f, 0.35f), listOf(1330f, 0.04f), listOf(1550f, 0.0f), listOf(1620f, 0.0f), listOf(1663f, 0.855f), listOf(1700f, 0.0f), listOf(1800f, 0.65f), listOf(1855f, 0.0f), listOf(1920f, 0.4f), listOf(2000f, 0.0f)),
        listOf(listOf(0f, 0.72f), listOf(1550f, 0.72f), listOf(1655f, 0.8f), listOf(2000f, 0.7f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.35f, 0.7f),
        listOf(600f, 0.35f, 0.7f),
        listOf(1200f, 0.35f, 0.7f),
        listOf(1800f, 0.65f, 0.65f),
        listOf(1920f, 0.4f, 0.6f)
      ),
) {
    override val name: String = "Sonar"
}
