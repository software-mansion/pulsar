package com.swmansion.pulsar.haptics

import android.os.Build
import android.os.VibrationEffect
import androidx.annotation.RequiresApi
import com.swmansion.pulsar.types.CompatibilityMode
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.ControlPoint

class HapticBuilder(engine: HapticEngineWrapper) {

  private var vibrationEffectsGenerator = VibrationEffectsGenerator(engine)

  @RequiresApi(Build.VERSION_CODES.O)
  fun createVibrationEffect(preset: PatternData): VibrationEffect {
    val controlPoints = convertToControlPoints(preset)
    return vibrationEffectsGenerator.convertToVibrationEffect(controlPoints)
  }

  private fun convertToControlPoints(preset: PatternData): List<ControlPoint> {
    val amplitudeLine = ValueLineBuilder(preset.continuousPattern.amplitude)
    val frequencyLine = ValueLineBuilder(preset.continuousPattern.frequency)

    val peakLineBuilder = PeakLineBuilder()
    val discreteAmplitudeLine = peakLineBuilder.convertToContinuousPatternOfAmplitude(preset.discretePattern, amplitudeLine)
    val discreteFrequencyLine = peakLineBuilder.convertToContinuousPatternOfFrequency(preset.discretePattern, frequencyLine)

    amplitudeLine.mergeLine(discreteAmplitudeLine)
    frequencyLine.mergeLine(discreteFrequencyLine)

    val configLine = ConfigLineBuilder(amplitudeLine, frequencyLine)
    val controlLine = ControlLineBuilder(configLine)

    return controlLine.points
  }

  fun simulateCompatibilityMode(mode: CompatibilityMode) {
    vibrationEffectsGenerator.simulateCompatibilityMode(mode)
  }

}
