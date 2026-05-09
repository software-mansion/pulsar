package com.swmansion.pulsar.kmp.iosimpl.haptics

import platform.CoreHaptics.CHHapticDynamicParameterIDHapticSharpnessControl

internal class IOSSharpnessCurveLineModifier : IOSCurveLineModifier(
    parameterId = CHHapticDynamicParameterIDHapticSharpnessControl,
)
