package com.swmansion.pulsar

internal class FirecrackerPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(),
        listOf(),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 1.0f, 1.0f),
        listOf(75f, 1.0f, 1.0f)
      ),
) {
    override val name: String = "Firecracker"
}
