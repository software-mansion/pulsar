package com.swmansion.pulsar.haptics

import android.os.Build
import android.os.VibrationEffect
import androidx.annotation.RequiresApi
import com.swmansion.pulsar.types.PatternData
import kotlin.math.roundToInt

class ImpulseCompositionHapticBuilder {

    companion object {
        /**
         * Width of a single impulse rendered as a plain waveform on devices that can't play
         * primitives. The continuous-envelope fallback collapses a transient into a ~2 ms peak
         * (and dilutes its amplitude across coarse 13 Hz steps), which is far too short to spin up
         * a weak ERM/LRA actuator — so the tap is silent on cheaper/older devices even though it
         * fires on capable ones. Web's Vibration API hits the same hardware with a >=20 ms
         * full-power on-pulse and works, so we mirror that here: 20 ms is long enough to engage the
         * motor yet short enough to still read as a tap.
         */
        private const val IMPULSE_PULSE_DURATION_MS = 20L

        /**
         * Minimum amplitude (0..255) for an impulse on devices with amplitude control. A soft
         * impulse scaled straight to e.g. 13/255 sits below a weak actuator's start threshold and
         * never engages; flooring it keeps quiet impulses perceptible instead of silent. Capable
         * devices never reach this path (they play primitives), so this only trades fine amplitude
         * resolution for reliability on hardware that lacks it.
         */
        private const val MIN_IMPULSE_AMPLITUDE = 64

        /**
         * Returns true if the preset consists only of impulses:
         * discretePattern is non-empty and continuousPattern has no non-zero amplitude points.
         */
        fun isImpulsesOnly(preset: PatternData): Boolean {
            if (preset.discretePattern.isEmpty()) return false
            return preset.continuousPattern.amplitude.none { it.value > 0f }
        }

        /**
         * Builds the alternating off/on timing array (and matching amplitudes) for an impulse-only
         * preset: each impulse becomes a gap from the previous pulse followed by a fixed-width,
         * (near-)full-power pulse. Pure function, extracted for testing without the Android
         * VibrationEffect framework. Returns null when there is nothing playable.
         */
        fun buildImpulseWaveform(preset: PatternData): Pair<LongArray, IntArray>? {
            val impulses = preset.discretePattern.sortedBy { it.time }
            if (impulses.isEmpty()) return null

            val timings = ArrayList<Long>()
            val amplitudes = ArrayList<Int>()
            var cursor = 0L

            for (impulse in impulses) {
                val gap = (impulse.time - cursor).coerceAtLeast(0L)
                timings.add(gap)
                amplitudes.add(0)

                timings.add(IMPULSE_PULSE_DURATION_MS)
                val amplitude = (impulse.amplitude.coerceIn(0f, 1f) * 255).roundToInt()
                    .coerceIn(MIN_IMPULSE_AMPLITUDE, 255)
                amplitudes.add(amplitude)

                cursor = impulse.time + IMPULSE_PULSE_DURATION_MS
            }

            if (timings.none { it > 0L }) return null
            return timings.toLongArray() to amplitudes.toIntArray()
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

    /**
     * Plain-waveform fallback for impulse-only presets on devices that can't play primitives
     * (API < 30, or actuators without primitive support). Each impulse is rendered as a crisp,
     * (near-)full-power pulse so it reliably engages weak ERM/LRA hardware — the case where the
     * continuous-envelope path produces a sub-perceptible smear. Returns null if nothing playable.
     */
    @RequiresApi(Build.VERSION_CODES.O)
    fun createWaveformEffect(preset: PatternData, engine: HapticEngineWrapper): VibrationEffect? {
        val (timings, amplitudes) = buildImpulseWaveform(preset) ?: return null
        return if (engine.isAmplitudeSupported()) {
            VibrationEffect.createWaveform(timings, amplitudes, -1)
        } else {
            // No amplitude control: the alternating off/on timings already drive full power.
            VibrationEffect.createWaveform(timings, -1)
        }
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
