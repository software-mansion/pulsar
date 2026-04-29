package com.swmansion.pulsar

internal class MarchPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(15f, 0.6f), listOf(150f, 0.45f), listOf(250f, 0.0f), listOf(300f, 0.0f), listOf(315f, 0.65f), listOf(450f, 0.5f), listOf(550f, 0.0f), listOf(600f, 0.0f), listOf(615f, 0.6f), listOf(750f, 0.4f), listOf(900f, 0.0f)),
        listOf(listOf(0f, 0.25f), listOf(900f, 0.25f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.65f, 0.28f),
        listOf(300f, 0.7f, 0.28f),
        listOf(600f, 0.65f, 0.28f)
      ),
) {
    override val name: String = "March"
}
