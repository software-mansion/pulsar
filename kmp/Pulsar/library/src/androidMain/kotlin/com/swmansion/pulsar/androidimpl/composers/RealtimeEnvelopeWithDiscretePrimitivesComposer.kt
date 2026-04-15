package com.swmansion.pulsar.androidimpl.composers

import android.os.Build
import android.os.VibrationEffect
import androidx.annotation.RequiresApi
import com.swmansion.pulsar.androidimpl.haptics.HapticEngineWrapper

class RealtimeEnvelopeWithDiscretePrimitivesComposer(
    private val engine: HapticEngineWrapper
) : RealtimeEnvelopeComposer(engine) {

    override fun playDiscrete(amplitude: Float, frequency: Float) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return
        }
        val effect = createCompositionEffect(amplitude, frequency)
        engine.vibrate(effect)
    }

    @RequiresApi(Build.VERSION_CODES.O)
    private fun createCompositionEffect(amplitude: Float, frequency: Float): VibrationEffect {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            VibrationEffect.startComposition()
                .addPrimitive(
                    selectPrimitive(frequency),
                    amplitude,
                    0
                ).compose()
        } else {
            VibrationEffect.createOneShot(10, (amplitude * 255).toInt().coerceIn(0, 255))
        }
    }

    @RequiresApi(Build.VERSION_CODES.TIRAMISU)
    private fun selectPrimitive(value: Float): Int {
        return when {
            value > 0.66f -> VibrationEffect.Composition.PRIMITIVE_CLICK
            value > 0.33f -> VibrationEffect.Composition.PRIMITIVE_TICK
            else -> VibrationEffect.Composition.PRIMITIVE_LOW_TICK
        }
    }
}
