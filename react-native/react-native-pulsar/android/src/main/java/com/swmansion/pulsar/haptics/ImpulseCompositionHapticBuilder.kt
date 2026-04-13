package com.swmansion.pulsar.haptics

import android.os.Build
import android.os.VibrationEffect
import androidx.annotation.RequiresApi
import com.swmansion.pulsar.types.PatternData

class ImpulseCompositionHapticBuilder {

    companion object {
        /**
         * Returns true if the preset consists only of impulses:
         * discretePattern is non-empty and continuousPattern has no non-zero amplitude points.
         */
        fun isImpulsesOnly(preset: PatternData): Boolean {
            if (preset.discretePattern.isEmpty()) return false
            return preset.continuousPattern.amplitude.none { it.value > 0f }
        }
    }

    /**
     * Builds a VibrationEffect.Composition from the preset's discretePattern.
     * Returns null if the device API is below 30 — caller should fall back to envelope path.
     */
    @RequiresApi(Build.VERSION_CODES.O)
    fun createCompositionEffect(preset: PatternData): VibrationEffect? {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) return null

        val impulses = preset.discretePattern.sortedBy { it.time }
        if (impulses.isEmpty()) return null

        val composition = VibrationEffect.startComposition()
        var prevTime = 0L

        for (impulse in impulses) {
            val delay = (impulse.time - prevTime).toInt().coerceAtLeast(0)
            val primitive = selectPrimitive(impulse.frequency)
            val amplitude = impulse.amplitude.coerceIn(0f, 1f)
            composition.addPrimitive(primitive, amplitude, delay)
            prevTime = impulse.time
        }

        return composition.compose()
    }

    @RequiresApi(Build.VERSION_CODES.R)
    private fun selectPrimitive(frequency: Float): Int {
        return when {
            frequency > 0.66f -> VibrationEffect.Composition.PRIMITIVE_CLICK
            frequency > 0.33f -> VibrationEffect.Composition.PRIMITIVE_TICK
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU ->
                VibrationEffect.Composition.PRIMITIVE_LOW_TICK
            else -> VibrationEffect.Composition.PRIMITIVE_TICK
        }
    }
}
