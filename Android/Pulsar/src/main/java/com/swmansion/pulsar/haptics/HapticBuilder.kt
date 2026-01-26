package com.swmansion.pulsar.haptics

import android.os.VibrationEffect
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.ControlPoint

class HapticBuilder(engine: HapticEngineWrapper) {

  private var vibrationEffectsGenerator = VibrationEffectsGenerator(engine)

  fun createVibrationEffect(preset: PatternData): VibrationEffect {
    val controlPoints = convertToControlPoints(preset)
    return vibrationEffectsGenerator.convertToVibrationEffect(controlPoints)
  }

  private fun convertToControlPoints(preset: PatternData): List<ControlPoint> {
    val amplitudeLine = ValueLineBuilder(preset.continuesPattern.amplitude)
    val frequencyLine = ValueLineBuilder(preset.continuesPattern.frequency)

    val peakLineBuilder = PeakLineBuilder()
    val discreteAmplitudeLine = peakLineBuilder.convertToContinuesPatternOfAmplitude(preset.discretePattern, amplitudeLine)
    val discreteFrequencyLine = peakLineBuilder.convertToContinuesPatternOfFrequency(preset.discretePattern, frequencyLine)

    amplitudeLine.mergeLine(discreteAmplitudeLine)
    frequencyLine.mergeLine(discreteFrequencyLine)

    val configLine = ConfigLineBuilder(amplitudeLine, frequencyLine)
    val controlLine = ControlLineBuilder(configLine)

    return controlLine.points
  }

}
