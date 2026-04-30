package com.swmansion.pulsar.kmp

import platform.CoreHaptics.CHHapticDynamicParameterIDHapticSharpnessControl

internal class IOSSharpnessCurveLineModifier : IOSCurveLineModifier(
    parameterId = CHHapticDynamicParameterIDHapticSharpnessControl,
)
