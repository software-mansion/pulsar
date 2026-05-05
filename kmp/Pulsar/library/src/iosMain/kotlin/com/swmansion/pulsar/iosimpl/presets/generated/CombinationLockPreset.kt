package com.swmansion.pulsar.kmp.iosimpl.presets.generated

import com.swmansion.pulsar.kmp.IOSPulsarHandle
import com.swmansion.pulsar.kmp.iosimpl.presets.IOSPlayer
internal class CombinationLockPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(4f, 0.62f), listOf(25f, 0.0f), listOf(180f, 0.6f), listOf(201f, 0.0f), listOf(360f, 0.63f), listOf(381f, 0.0f), listOf(540f, 0.6f), listOf(561f, 0.0f), listOf(720f, 0.62f), listOf(741f, 0.0f), listOf(900f, 0.9f), listOf(935f, 0.2f), listOf(980f, 0.0f)),
        listOf(listOf(0f, 0.75f), listOf(900f, 0.75f), listOf(980f, 0.7f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.62f, 0.75f),
        listOf(180f, 0.6f, 0.75f),
        listOf(360f, 0.63f, 0.75f),
        listOf(540f, 0.6f, 0.75f),
        listOf(720f, 0.62f, 0.75f),
        listOf(900f, 0.9f, 0.72f)
      ),
) {
    override val name: String = "CombinationLock"
}
