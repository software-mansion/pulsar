package com.swmansion.pulsar

import platform.CoreHaptics.CHHapticDynamicParameterIDHapticIntensityControl

internal class IOSIntensityCurveLineModifier : IOSCurveLineModifier(
    parameterId = CHHapticDynamicParameterIDHapticIntensityControl,
)
