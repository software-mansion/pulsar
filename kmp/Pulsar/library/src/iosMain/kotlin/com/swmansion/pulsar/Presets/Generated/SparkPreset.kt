package com.swmansion.pulsar

internal class SparkPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(4f, 0.22f), listOf(28f, 0.0f), listOf(69f, 0.52f), listOf(95f, 0.0f), listOf(142f, 1.0f), listOf(185f, 0.0f)),
        listOf(listOf(0f, 0.5f), listOf(65f, 0.75f), listOf(138f, 1.0f), listOf(185f, 1.0f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.22f, 0.55f),
        listOf(65f, 0.52f, 0.78f),
        listOf(138f, 1.0f, 1.0f)
      ),
) {
    override val name: String = "Spark"
}
