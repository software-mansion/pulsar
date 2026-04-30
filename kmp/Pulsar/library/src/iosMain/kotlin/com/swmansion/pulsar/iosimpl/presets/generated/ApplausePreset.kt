package com.swmansion.pulsar.kmp.iosimpl.presets.generated

import com.swmansion.pulsar.kmp.IOSPulsarHandle
import com.swmansion.pulsar.kmp.iosimpl.presets.IOSPlayer
internal class ApplausePreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(10f, 0.2f), listOf(1482f, 0.266f), listOf(1564f, 0.0f)),
        listOf(listOf(0f, 0.5f), listOf(990f, 0.72f), listOf(1250f, 0.7f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.2f, 0.5f),
        listOf(150f, 0.25f, 0.52f),
        listOf(290f, 0.3f, 0.54f),
        listOf(420f, 0.4f, 0.56f),
        listOf(540f, 0.5f, 0.58f),
        listOf(650f, 0.484f, 0.6f),
        listOf(750f, 0.509f, 0.62f),
        listOf(868f, 0.503f, 0.65f),
        listOf(968f, 0.45f, 0.716f),
        listOf(1063f, 0.434f, 0.725f),
        listOf(1159f, 0.488f, 0.759f),
        listOf(1256f, 0.506f, 1.0f),
        listOf(1349f, 0.528f, 1.0f),
        listOf(1432f, 0.519f, 1.0f),
        listOf(1530f, 0.528f, 1.0f)
      ),
) {
    override val name: String = "Applause"
}
