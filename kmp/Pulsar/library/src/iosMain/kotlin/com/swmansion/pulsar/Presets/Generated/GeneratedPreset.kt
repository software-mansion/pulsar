package com.swmansion.pulsar

internal open class IOSGeneratedPreset(
    haptics: IOSPulsarHandle,
    presetName: String,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = requireNotNull(iosGeneratedPresetPatterns[presetName]).continuous,
    rawDiscretePattern = requireNotNull(iosGeneratedPresetPatterns[presetName]).discrete,
) {
    override val name: String = presetName
}
