package com.swmansion.pulsar.kmp

internal class AlarmPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(10f, 0.9f), listOf(130f, 0.0f), listOf(200f, 0.9f), listOf(330f, 0.0f), listOf(400f, 0.9f), listOf(530f, 0.0f), listOf(600f, 0.9f), listOf(730f, 0.0f), listOf(800f, 0.9f), listOf(930f, 0.0f), listOf(1000f, 0.9f), listOf(1130f, 0.0f)),
        listOf(listOf(0f, 0.82f), listOf(130f, 0.82f), listOf(200f, 0.48f), listOf(330f, 0.48f), listOf(400f, 0.82f), listOf(530f, 0.82f), listOf(600f, 0.48f), listOf(730f, 0.48f), listOf(800f, 0.82f), listOf(930f, 0.82f), listOf(1000f, 0.48f), listOf(1130f, 0.48f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.9f, 0.8f),
        listOf(200f, 0.9f, 0.5f),
        listOf(400f, 0.9f, 0.8f),
        listOf(600f, 0.9f, 0.5f),
        listOf(800f, 0.9f, 0.8f),
        listOf(1000f, 0.9f, 0.5f)
      ),
) {
    override val name: String = "Alarm"
}
