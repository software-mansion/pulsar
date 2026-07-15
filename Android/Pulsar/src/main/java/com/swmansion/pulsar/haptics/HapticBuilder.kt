package com.swmansion.pulsar.haptics

import android.os.Build
import android.os.VibrationEffect
import androidx.annotation.RequiresApi
import com.swmansion.pulsar.types.CompatibilityMode
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.ControlPoint

class HapticBuilder(private val engine: HapticEngineWrapper) {

  private var vibrationEffectsGenerator = VibrationEffectsGenerator(engine)
  private val impulseCompositionBuilder = ImpulseCompositionHapticBuilder()
  private var impulseCompositionEnabled = true

  fun enableImpulseCompositionMode(enabled: Boolean) {
    impulseCompositionEnabled = enabled
  }

  @RequiresApi(Build.VERSION_CODES.O)
  fun createVibrationEffect(preset: PatternData): VibrationEffect? {
    if (impulseCompositionEnabled && ImpulseCompositionHapticBuilder.isImpulsesOnly(preset)) {
      val effect = impulseCompositionBuilder.createCompositionEffect(preset, engine)
      if (effect != null) return effect
      return createImpulseFallbackEffect(preset)
    }
    val controlPoints = convertToControlPoints(preset)
    return vibrationEffectsGenerator.convertToVibrationEffect(controlPoints)
  }

  /**
   * Fallback for impulse-only presets on hardware that cannot play primitives (API < 30, or an
   * actuator without primitive support).
   *
   * The default path quantizes the control line into ~13 Hz steps and area-averages each bucket
   * ([ControlLineBuilder.getStepsPoints]). That is right for continuous envelopes, but it destroys
   * transients: averaging an impulse across a 76 ms bucket drops it to ~8-30/255 — below a weak
   * actuator's start threshold — and neighbouring impulses smear together into one buzz instead of
   * separate taps.
   *
   * Impulse-only presets have few control points and no envelope to keep up with, so we skip the
   * quantizer and hand the linear points straight to [VibrationEffectsGenerator], which already
   * picks the right representation for the device (advanced/basic envelope, amplitude waveform, or
   * timing-only waveform) and honours the simulated compatibility mode. The peaks are already sized
   * for the actuator by [HapticEngineWrapper.getMinControlPointDurationMillis], which widens them
   * on hardware too sluggish to feel a short pulse.
   */
  @RequiresApi(Build.VERSION_CODES.O)
  private fun createImpulseFallbackEffect(preset: PatternData): VibrationEffect? {
    val controlLine = convertToControlPoints(preset)
    return vibrationEffectsGenerator.convertToVibrationEffect(controlLine.getLinearPoints())
  }

  private fun convertToControlPoints(preset: PatternData): ControlLineBuilder =
    buildControlLine(preset, engine.getMinControlPointDurationMillis())

  fun simulateCompatibilityMode(mode: CompatibilityMode) {
    vibrationEffectsGenerator.simulateCompatibilityMode(mode)
  }

  companion object {
    /**
     * Turns a preset into the control line the effect generator consumes. Pure — takes the peak
     * width instead of reading it off the engine, so it is exercisable without an Android device.
     */
    fun buildControlLine(preset: PatternData, minTransitionDuration: Long): ControlLineBuilder {
      val amplitudeLine = ValueLineBuilder(preset.continuousPattern.amplitude)
      val frequencyLine = ValueLineBuilder(preset.continuousPattern.frequency)

      val peakLineBuilder = PeakLineBuilder(minTransitionDuration)
      val discreteAmplitudeLine = peakLineBuilder.convertToContinuousPatternOfAmplitude(preset.discretePattern, amplitudeLine)
      val discreteFrequencyLine = peakLineBuilder.convertToContinuousPatternOfFrequency(preset.discretePattern, frequencyLine)

      amplitudeLine.mergeLine(discreteAmplitudeLine)
      frequencyLine.mergeLine(discreteFrequencyLine)

      val configLine = ConfigLineBuilder(amplitudeLine, frequencyLine)

      return ControlLineBuilder(configLine)
    }
  }
}
