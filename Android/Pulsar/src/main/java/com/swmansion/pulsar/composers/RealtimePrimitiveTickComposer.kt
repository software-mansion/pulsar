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
        // A stream of ticks needs clear air between each one, otherwise the individual clicks blur
        // into a continuous buzz (the shared primitive defaults drop to ~10ms at high frequency).
        // Widen the cadence so ticks stay distinct across the whole frequency range.
        minIntervalMs = maxOf(minIntervalMs, 60L)
        maxIntervalMs = maxOf(maxIntervalMs, 300L)
    }

    @RequiresApi(android.os.Build.VERSION_CODES.TIRAMISU)
    override fun selectPrimitive(value: Float): Int {
        return VibrationEffect.Composition.PRIMITIVE_CLICK
    }
}
