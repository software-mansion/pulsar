package com.swmansion.pulsar.kmp.iosimpl.presets.generated

import com.swmansion.pulsar.kmp.IOSPulsarHandle
import com.swmansion.pulsar.kmp.iosimpl.presets.IOSPlayer
internal class PlummetPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(300f, 0.02f), listOf(600f, 0.06f), listOf(800f, 0.15f), listOf(880f, 0.3f), listOf(895f, 0.5f), listOf(900f, 0.0f), listOf(905f, 1.0f), listOf(960f, 0.4f), listOf(1050f, 0.0f)),
        listOf(listOf(0f, 0.3f), listOf(895f, 0.4f), listOf(905f, 0.3f), listOf(1050f, 0.25f)),
      ),
    rawDiscretePattern = listOf(
        listOf(900f, 1.0f, 0.4f)
      ),
) {
    override val name: String = "Plummet"
}
