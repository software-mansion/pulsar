package com.swmansion.pulsar.kmp

import platform.CoreHaptics.CHHapticDynamicParameterIDHapticIntensityControl

internal class IOSIntensityCurveLineModifier : IOSCurveLineModifier(
    parameterId = CHHapticDynamicParameterIDHapticIntensityControl,
)
