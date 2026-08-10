package com.swmansion.pulsar.composers

import android.os.VibrationEffect
import androidx.annotation.RequiresApi
import com.swmansion.pulsar.haptics.HapticEngineWrapper
import com.swmansion.pulsar.types.CompatibilityMode

class RealtimePrimitiveTickComposer(
    engine: HapticEngineWrapper,
    compatibilityMode: CompatibilityMode,
) : RealtimePrimitiveComposer(engine, compatibilityMode) {

    init {
        minIntervalMs = maxOf(minIntervalMs, 60L)
        maxIntervalMs = maxOf(maxIntervalMs, 300L)
    }

    @RequiresApi(android.os.Build.VERSION_CODES.TIRAMISU)
    override fun selectPrimitive(value: Float): Int {
        return VibrationEffect.Composition.PRIMITIVE_CLICK
    }
}
