package com.swmansion.pulsar.kmp.iosimpl.presets.generated

import com.swmansion.pulsar.kmp.IOSPulsarHandle
import com.swmansion.pulsar.kmp.iosimpl.presets.IOSPlayer
internal class PropelPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(8f, 0.55f), listOf(70f, 0.2f), listOf(120f, 0.88f), listOf(200f, 0.2f), listOf(300f, 0.0f)),
        listOf(listOf(0f, 0.56f), listOf(120f, 0.72f), listOf(300f, 0.65f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.6f, 0.58f),
        listOf(120f, 0.9f, 0.72f)
      ),
) {
    override val name: String = "Propel"
}
