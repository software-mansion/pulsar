package com.swmansion.pulsar.kmp.iosimpl.presets.generated

import com.swmansion.pulsar.kmp.IOSPulsarHandle
import com.swmansion.pulsar.kmp.iosimpl.presets.IOSPlayer
internal class ZipperPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(6f, 0.234f), listOf(432f, 0.231f), listOf(460f, 0.0f)),
        listOf(listOf(0f, 0.616f), listOf(358f, 0.594f), listOf(460f, 0.35f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.35f, 0.8f),
        listOf(40f, 0.35f, 0.8f),
        listOf(80f, 0.35f, 0.8f),
        listOf(120f, 0.35f, 0.8f),
        listOf(160f, 0.35f, 0.8f),
        listOf(200f, 0.35f, 0.8f),
        listOf(240f, 0.35f, 0.8f),
        listOf(280f, 0.35f, 0.8f),
        listOf(320f, 0.35f, 0.8f),
        listOf(360f, 0.35f, 0.8f),
        listOf(400f, 0.35f, 0.8f),
        listOf(430f, 0.6f, 0.75f)
      ),
) {
    override val name: String = "Zipper"
}
