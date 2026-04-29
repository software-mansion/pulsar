package com.swmansion.pulsar

import platform.CoreHaptics.CHHapticDynamicParameterIDHapticSharpnessControl

internal class IOSSharpnessCurveLineModifier : IOSCurveLineModifier(
    parameterId = CHHapticDynamicParameterIDHapticSharpnessControl,
)
