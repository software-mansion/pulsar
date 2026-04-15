package com.swmansion.pulsar.androidimpl.composers

import android.os.VibrationEffect
import androidx.annotation.RequiresApi
import com.swmansion.pulsar.androidimpl.haptics.HapticEngineWrapper
import com.swmansion.pulsar.androidimpl.types.CompatibilityMode

class RealtimePrimitiveTickComposer(
    engine: HapticEngineWrapper,
    compatibilityMode: CompatibilityMode,
) : RealtimePrimitiveComposer(engine, compatibilityMode) {

    @RequiresApi(android.os.Build.VERSION_CODES.TIRAMISU)
    override fun selectPrimitive(value: Float): Int {
        return VibrationEffect.Composition.PRIMITIVE_TICK
    }
}
