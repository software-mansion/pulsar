package com.swmansion.pulsar.kmp.iosimpl.presets.generated

import com.swmansion.pulsar.kmp.IOSPulsarHandle
import com.swmansion.pulsar.kmp.iosimpl.presets.IOSPlayer
internal class DirgePreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(30f, 0.4f), listOf(300f, 0.2f), listOf(700f, 0.0f), listOf(900f, 0.0f), listOf(930f, 0.38f), listOf(1200f, 0.18f), listOf(1700f, 0.0f), listOf(1900f, 0.0f), listOf(1930f, 0.32f), listOf(2200f, 0.12f), listOf(2600f, 0.0f)),
        listOf(listOf(0f, 0.14f), listOf(2600f, 0.11f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.45f, 0.15f),
        listOf(900f, 0.4f, 0.13f),
        listOf(1900f, 0.35f, 0.12f)
      ),
) {
    override val name: String = "Dirge"
}
