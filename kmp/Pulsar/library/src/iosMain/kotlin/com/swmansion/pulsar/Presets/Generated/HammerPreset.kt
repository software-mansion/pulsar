package com.swmansion.pulsar

internal class HammerPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(8f, 0.75f), listOf(90f, 0.05f), listOf(180f, 0.0f), listOf(220f, 0.8f), listOf(310f, 0.05f), listOf(380f, 0.0f), listOf(420f, 0.88f), listOf(508f, 0.05f), listOf(550f, 0.0f), listOf(590f, 0.92f), listOf(678f, 0.05f), listOf(710f, 0.0f), listOf(740f, 1.0f), listOf(816f, 0.05f), listOf(840f, 0.0f), listOf(870f, 1.0f), listOf(950f, 0.05f), listOf(1050f, 0.0f)),
        listOf(listOf(0f, 0.28f), listOf(1050f, 0.28f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.75f, 0.3f),
        listOf(220f, 0.8f, 0.32f),
        listOf(420f, 0.88f, 0.3f),
        listOf(590f, 0.92f, 0.32f),
        listOf(740f, 1.0f, 0.3f),
        listOf(870f, 1.0f, 0.3f)
      ),
) {
    override val name: String = "Hammer"
}
