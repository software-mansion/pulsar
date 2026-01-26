package com.swmansion.pulsar.types

/**
 * @param intensity should be value from [0-1].
 * @param sharpness should be value from [0-1].
 * @param duration transition time in ms.
 */
data class ControlPoint(val intensity: Float, val sharpness: Float, val duration: Long)

/**
 *
 * @param time transition time in ms.
 * @param value should be value from [0-1].
 */
data class ValuePoint(
  val time: Float,
  val value: Float
)

/**
 * @param time relative time.
 * @param amplitude value from range [0-1].
 * @param frequency value from range [0-1]. Ignored for devices that do not support envelopes.
 */
data class ConfigPoint(
  val time: Float,
  val amplitude: Float,
  val frequency: Float
)

data class ContinuesPattern(
  val amplitude: List<ValuePoint>,
  val frequency: List<ValuePoint>
)

data class PatternData(
  val continuesPattern: ContinuesPattern,
  val discretePattern: List<ConfigPoint>
) {
  constructor(rawContinuesPattern: List<List<List<Double>>>, rawDiscretePattern: List<List<Double>>) : this(
    continuesPattern = ContinuesPattern(
      amplitude = rawContinuesPattern[0].map { ValuePoint(time = it[0].toFloat(), value = it[1].toFloat()) },
      frequency = rawContinuesPattern[1].map { ValuePoint(time = it[0].toFloat(), value = it[1].toFloat()) }
    ),
    discretePattern = rawDiscretePattern.map { ConfigPoint(time = it[0].toFloat(), amplitude = it[1].toFloat(), frequency = it[2].toFloat()) }
  )
}
