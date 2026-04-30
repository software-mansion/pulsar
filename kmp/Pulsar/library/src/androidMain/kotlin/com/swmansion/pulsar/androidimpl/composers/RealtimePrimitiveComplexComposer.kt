package com.swmansion.pulsar.kmp.androidimpl.composers

import android.os.VibrationEffect
import androidx.annotation.RequiresApi
import com.swmansion.pulsar.kmp.androidimpl.haptics.HapticEngineWrapper
import com.swmansion.pulsar.kmp.androidimpl.types.CompatibilityMode

class RealtimePrimitiveComplexComposer(
    engine: HapticEngineWrapper,
    compatibilityMode: CompatibilityMode,
) : RealtimePrimitiveComposer(engine, compatibilityMode) {

    @RequiresApi(android.os.Build.VERSION_CODES.TIRAMISU)
    override fun selectPrimitive(value: Float): Int {
        return when {
            value > 0.66f -> VibrationEffect.Composition.PRIMITIVE_CLICK
            value > 0.33f -> VibrationEffect.Composition.PRIMITIVE_TICK
            else -> VibrationEffect.Composition.PRIMITIVE_LOW_TICK
        }
    }
}
