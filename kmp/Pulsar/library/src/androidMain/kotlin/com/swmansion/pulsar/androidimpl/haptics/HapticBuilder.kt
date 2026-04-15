package com.swmansion.pulsar.androidimpl.haptics

import android.os.Build
import android.os.VibrationEffect
import androidx.annotation.RequiresApi
import com.swmansion.pulsar.androidimpl.types.CompatibilityMode
import com.swmansion.pulsar.androidimpl.types.PatternData
import com.swmansion.pulsar.androidimpl.types.ControlPoint

class HapticBuilder(private val engine: HapticEngineWrapper) {

  private var vibrationEffectsGenerator = VibrationEffectsGenerator(engine)
  private val impulseCompositionBuilder = ImpulseCompositionHapticBuilder()
  private var impulseCompositionEnabled = true

  fun enableImpulseCompositionMode(enabled: Boolean) {
    impulseCompositionEnabled = enabled
  }

  @RequiresApi(Build.VERSION_CODES.O)
  fun createVibrationEffect(preset: PatternData): VibrationEffect {
    if (impulseCompositionEnabled && ImpulseCompositionHapticBuilder.isImpulsesOnly(preset)) {
      val effect = impulseCompositionBuilder.createCompositionEffect(preset)
      if (effect != null) return effect
    }
    val controlPoints = convertToControlPoints(preset)
    return vibrationEffectsGenerator.convertToVibrationEffect(controlPoints)
  }

  private fun convertToControlPoints(preset: PatternData): ControlLineBuilder {
    val amplitudeLine = ValueLineBuilder(preset.continuousPattern.amplitude)
    val frequencyLine = ValueLineBuilder(preset.continuousPattern.frequency)

    val peakLineBuilder = PeakLineBuilder(engine.getMinControlPointDurationMillis())
    val discreteAmplitudeLine = peakLineBuilder.convertToContinuousPatternOfAmplitude(preset.discretePattern, amplitudeLine)
    val discreteFrequencyLine = peakLineBuilder.convertToContinuousPatternOfFrequency(preset.discretePattern, frequencyLine)

    amplitudeLine.mergeLine(discreteAmplitudeLine)
    frequencyLine.mergeLine(discreteFrequencyLine)

    val configLine = ConfigLineBuilder(amplitudeLine, frequencyLine)

    return ControlLineBuilder(configLine)
  }

  fun simulateCompatibilityMode(mode: CompatibilityMode) {
    vibrationEffectsGenerator.simulateCompatibilityMode(mode)
  }

}
