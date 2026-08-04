package com.swmansion.pulsar.haptics

import android.os.Vibrator
import com.swmansion.pulsar.types.ConfigPoint
import com.swmansion.pulsar.types.PatternData
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.RuntimeEnvironment
import org.robolectric.Shadows.shadowOf
import org.robolectric.annotation.Config

/**
 * Robolectric coverage of the real `VibrationEffect` generation pipeline
 * (`HapticBuilder` → `VibrationEffectsGenerator` → `PwmHapticsGenerator` → framework
 * `VibrationEffect.createWaveform`). These paths build genuine `android.os.VibrationEffect`
 * objects, so they can only run against the framework — not the plain-JVM suites.
 */
@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class RobolectricVibrationEffectTest {

    private fun engine(hasAmplitude: Boolean = false): HapticEngineWrapper {
        val app = RuntimeEnvironment.getApplication()
        val vibrator = app.getSystemService(Vibrator::class.java)
        shadowOf(vibrator).setHasVibrator(true)
        shadowOf(vibrator).setHasAmplitudeControl(hasAmplitude)
        return HapticEngineWrapper(app)
    }

    private val continuousPreset = PatternData(
        rawContinuousPattern = listOf(
            listOf(listOf(0f, 0f), listOf(500f, 1f), listOf(1000f, 0f)),
            listOf(listOf(0f, 0.5f), listOf(1000f, 0.5f)),
        ),
        rawDiscretePattern = listOf(),
    )

    private val impulsePreset = PatternData(
        rawDiscretePattern = listOf(
            listOf(0f, 1f, 0.3f),
            listOf(75f, 1f, 0.3f),
            listOf(150f, 1f, 0.3f),
        ),
    )

    @Test
    fun continuousPresetProducesAPwmWaveformWithoutAmplitudeControl() {
        val effect = engine(hasAmplitude = false).getHapticBuilder().createVibrationEffect(continuousPreset)
        assertNotNull("PWM waveform should be produced on a timing-only actuator", effect)
    }

    @Test
    fun continuousPresetProducesAnAmplitudeWaveformWithAmplitudeControl() {
        val effect = engine(hasAmplitude = true).getHapticBuilder().createVibrationEffect(continuousPreset)
        assertNotNull("amplitude waveform should be produced when the actuator supports it", effect)
    }

    @Test
    fun outOfRangeAmplitudeDoesNotThrowAtTheVibrationEffectBoundary() {
        // Regression for the [0,1] clamp: an amplitude of 2.0 would become 510 (> the motor's 255
        // ceiling) and VibrationEffect.createWaveform would throw. The clamp keeps it at 255.
        val outOfRange = PatternData(
            rawContinuousPattern = listOf(
                listOf(listOf(0f, 2.0f), listOf(500f, 2.0f)),
                listOf(listOf(0f, 0.5f), listOf(500f, 0.5f)),
            ),
            rawDiscretePattern = listOf(),
        )
        val effect = engine(hasAmplitude = true).getHapticBuilder().createVibrationEffect(outOfRange)
        assertNotNull("clamped amplitude must stay within the framework's accepted range", effect)
    }

    @Test
    fun impulseOnlyPresetProducesAnEffectViaCompositionOrFallback() {
        // Whether the composition path succeeds or falls back to a timing waveform, a felt effect
        // must come out.
        val effect = engine(hasAmplitude = false).getHapticBuilder().createVibrationEffect(impulsePreset)
        assertNotNull(effect)
    }

    @Test
    fun impulseTimingWaveformIsBuiltFromDiscretePoints() {
        val generator = VibrationEffectsGenerator(engine(hasAmplitude = false))
        val effect = generator.convertToImpulseTimingWaveform(
            listOf(
                ConfigPoint(time = 0L, amplitude = 1f, frequency = 0.3f),
                ConfigPoint(time = 75L, amplitude = 1f, frequency = 0.3f),
            ),
        )
        assertNotNull(effect)
    }

    @Test
    fun impulseTimingWaveformIsNullForNoImpulses() {
        val generator = VibrationEffectsGenerator(engine(hasAmplitude = false))
        assertNull(generator.convertToImpulseTimingWaveform(emptyList()))
    }

    @Test
    @Config(sdk = [26])
    fun compositionEffectIsNullBelowApi30() {
        // Pre-R has no composition primitives, so the impulse-composition path bows out (the caller
        // then falls back). This is the documented contract of createCompositionEffect.
        val effect = ImpulseCompositionHapticBuilder()
            .createCompositionEffect(impulsePreset, engine(hasAmplitude = false))
        assertNull(effect)
    }
}
