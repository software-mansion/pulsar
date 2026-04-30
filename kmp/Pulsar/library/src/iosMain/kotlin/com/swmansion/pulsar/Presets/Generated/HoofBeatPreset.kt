package com.swmansion.pulsar.kmp

internal class HoofBeatPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(),
        listOf(),
      ),
    rawDiscretePattern = listOf(
        listOf(10f, 1.0f, 0.106f),
        listOf(201f, 1.0f, 0.109f)
      ),
) {
    override val name: String = "HoofBeat"
}
