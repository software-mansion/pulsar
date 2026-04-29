package com.swmansion.pulsar

import platform.UIKit.UIImpactFeedbackGenerator
import platform.UIKit.UIImpactFeedbackStyle
import platform.UIKit.UINotificationFeedbackGenerator
import platform.UIKit.UINotificationFeedbackType
import platform.UIKit.UISelectionFeedbackGenerator

internal class IOSSystemImpactLightPreset(haptics: IOSPulsarHandle) : IOSSystemImpactPreset(
    haptics = haptics,
    presetName = "SystemImpactLight",
    style = UIImpactFeedbackStyle.UIImpactFeedbackStyleLight,
    rawDiscretePattern = listOf(listOf(0f, 0.55f, 0.4f)),
)

internal class IOSSystemImpactMediumPreset(haptics: IOSPulsarHandle) : IOSSystemImpactPreset(
    haptics = haptics,
    presetName = "SystemImpactMedium",
    style = UIImpactFeedbackStyle.UIImpactFeedbackStyleMedium,
    rawDiscretePattern = listOf(listOf(0f, 0.7f, 0.3f)),
)

internal class IOSSystemImpactHeavyPreset(haptics: IOSPulsarHandle) : IOSSystemImpactPreset(
    haptics = haptics,
    presetName = "SystemImpactHeavy",
    style = UIImpactFeedbackStyle.UIImpactFeedbackStyleHeavy,
    rawDiscretePattern = listOf(listOf(0f, 1f, 0.45f)),
)

internal class IOSSystemImpactSoftPreset(haptics: IOSPulsarHandle) : IOSSystemImpactPreset(
    haptics = haptics,
    presetName = "SystemImpactSoft",
    style = UIImpactFeedbackStyle.UIImpactFeedbackStyleSoft,
    rawDiscretePattern = listOf(listOf(0f, 0.6f, 0.1f)),
)

internal class IOSSystemImpactRigidPreset(haptics: IOSPulsarHandle) : IOSSystemImpactPreset(
    haptics = haptics,
    presetName = "SystemImpactRigid",
    style = UIImpactFeedbackStyle.UIImpactFeedbackStyleRigid,
    rawDiscretePattern = listOf(listOf(0f, 0.8f, 0.95f)),
)

internal class IOSSystemNotificationSuccessPreset(haptics: IOSPulsarHandle) : IOSSystemNotificationPreset(
    haptics = haptics,
    presetName = "SystemNotificationSuccess",
    type = UINotificationFeedbackType.UINotificationFeedbackTypeSuccess,
    rawDiscretePattern = listOf(
        listOf(0f, 0.6f, 0.6f),
        listOf(150f, 1f, 1f),
    ),
)

internal class IOSSystemNotificationWarningPreset(haptics: IOSPulsarHandle) : IOSSystemNotificationPreset(
    haptics = haptics,
    presetName = "SystemNotificationWarning",
    type = UINotificationFeedbackType.UINotificationFeedbackTypeWarning,
    rawDiscretePattern = listOf(
        listOf(0f, 0.95f, 1f),
        listOf(150f, 0.6f, 0.9f),
    ),
)

internal class IOSSystemNotificationErrorPreset(haptics: IOSPulsarHandle) : IOSSystemNotificationPreset(
    haptics = haptics,
    presetName = "SystemNotificationError",
    type = UINotificationFeedbackType.UINotificationFeedbackTypeError,
    rawDiscretePattern = listOf(
        listOf(0f, 0.7f, 0.5f),
        listOf(100f, 0.7f, 0.5f),
        listOf(200f, 0.7f, 0.8f),
        listOf(250f, 0.8f, 0.4f),
    ),
)

internal class IOSSystemSelectionPreset(haptics: IOSPulsarHandle) : IOSPlayer(
    haptics = haptics,
    audioOnly = true,
    rawDiscretePattern = listOf(listOf(0f, 0.4f, 0.7f)),
) {
    private val feedbackGenerator = UISelectionFeedbackGenerator()

    override val name: String = "SystemSelection"

    init {
        feedbackGenerator.prepare()
    }

    override fun play() {
        if (!isEnabled) return
        super.play()
        feedbackGenerator.selectionChanged()
    }
}

internal open class IOSSystemImpactPreset(
    haptics: IOSPulsarHandle,
    private val presetName: String,
    style: UIImpactFeedbackStyle,
    rawDiscretePattern: List<List<Float>>,
) : IOSPlayer(
    haptics = haptics,
    audioOnly = true,
    rawDiscretePattern = rawDiscretePattern,
) {
    private val impactFeedbackGenerator = UIImpactFeedbackGenerator(style = style)

    override val name: String = presetName

    init {
        impactFeedbackGenerator.prepare()
    }

    override fun play() {
        if (!isEnabled) return
        super.play()
        impactFeedbackGenerator.impactOccurred()
    }
}

internal open class IOSSystemNotificationPreset(
    haptics: IOSPulsarHandle,
    private val presetName: String,
    private val type: UINotificationFeedbackType,
    rawDiscretePattern: List<List<Float>>,
) : IOSPlayer(
    haptics = haptics,
    audioOnly = true,
    rawDiscretePattern = rawDiscretePattern,
) {
    private val feedbackGenerator = UINotificationFeedbackGenerator()

    override val name: String = presetName

    init {
        feedbackGenerator.prepare()
    }

    override fun play() {
        if (!isEnabled) return
        super.play()
        feedbackGenerator.notificationOccurred(type)
    }
}
