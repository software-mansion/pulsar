package com.swmansion.pulsar.haptics

import android.os.Build
import android.os.VibrationEffect
import androidx.annotation.RequiresApi
import com.swmansion.pulsar.types.PatternData

class ImpulseCompositionHapticBuilder {

    companion object {
        /**
         * Minimum peak width used when an impulse-only preset has to fall back to the generic
         * control-point path because the device cannot play primitives. The impulse ends up
         * rendered as a plain on/off waveform pulse roughly this wide.
         *
         * Determined empirically, like [ControlLineBuilder]'s step rate. The default 15 ms peak is
         * sized for envelope hardware; a cheap ERM cannot spin up in that time, so the tap is
         * simply never felt. Measured on a moto g05 (no primitives, no amplitude control, so every
         * impulse degrades to a bare on/off pulse): a 20 ms pulse is imperceptible, 40 ms is
         * clearly felt. For reference the vendor's own EFFECT_CLICK on that device is 35 ms and
         * EFFECT_TICK is 54 ms, so ~40 ms is the width the hardware itself treats as a tap.
         *
         * Raising this further would trade rhythm for strength: impulses closer together than the
         * pulse width can no longer be told apart.
         */
        const val MIN_IMPULSE_TRANSITION_MS = 40L

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
    fun createCompositionEffect(preset: PatternData, engine: HapticEngineWrapper): VibrationEffect? {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) return null

        val impulses = preset.discretePattern.sortedBy { it.time }
        if (impulses.isEmpty()) return null

        for (primitive in impulses.map { selectPrimitive(it.frequency) }.distinct()) {
            if (!engine.isPrimitiveSupported(primitive)) return null
        }

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

    @SupportedVibrationPrimitive
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
