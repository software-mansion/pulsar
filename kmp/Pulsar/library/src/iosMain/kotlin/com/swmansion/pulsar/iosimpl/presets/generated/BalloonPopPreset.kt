package com.swmansion.pulsar.kmp.iosimpl.presets.generated

import com.swmansion.pulsar.kmp.IOSPulsarHandle
import com.swmansion.pulsar.kmp.iosimpl.presets.IOSPlayer
internal class BalloonPopPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(50f, 0.1f), listOf(200f, 0.0f), listOf(300f, 0.15f), listOf(500f, 0.0f), listOf(600f, 0.25f), listOf(800f, 0.0f), listOf(900f, 0.35f), listOf(1100f, 0.0f), listOf(1200f, 0.5f), listOf(1380f, 0.0f), listOf(1400f, 1.0f), listOf(1440f, 0.6f), listOf(1550f, 0.1f), listOf(1700f, 0.0f)),
        listOf(listOf(0f, 0.2f), listOf(1380f, 0.5f), listOf(1400f, 1.0f), listOf(1700f, 0.3f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.1f, 0.3f),
        listOf(300f, 0.2f, 0.35f),
        listOf(600f, 0.3f, 0.4f),
        listOf(900f, 0.45f, 0.45f),
        listOf(1200f, 0.6f, 0.5f),
        listOf(1400f, 1.0f, 0.9f)
      ),
) {
    override val name: String = "BalloonPop"
}
