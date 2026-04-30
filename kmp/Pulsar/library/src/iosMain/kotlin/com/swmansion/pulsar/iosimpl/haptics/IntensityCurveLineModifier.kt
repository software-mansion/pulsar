package com.swmansion.pulsar.kmp.iosimpl.haptics

import platform.CoreHaptics.CHHapticDynamicParameterIDHapticIntensityControl

internal class IOSIntensityCurveLineModifier : IOSCurveLineModifier(
    parameterId = CHHapticDynamicParameterIDHapticIntensityControl,
)
