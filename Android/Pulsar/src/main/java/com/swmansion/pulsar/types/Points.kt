package com.swmansion.pulsar.types

/**
 * @param intensity should be value from [0-1].
 * @param sharpness should be value from [0-1].
 * @param duration transition time in ms.
 */
data class ControlPoint(
  val intensity: Float,
  val sharpness: Float,
  val duration: Long,
)

/**
 *
 * @param time transition time in ms.
 * @param value should be value from [0-1].
 */
data class ValuePoint(
  val time: Long,
  val value: Float,
)

/**
 * @param time relative time in ms.
 * @param amplitude value from range [0-1].
 * @param frequency value from range [0-1]. Ignored for devices that do not support envelopes.
 */
data class ConfigPoint(
  val time: Long,
  val amplitude: Float,
  val frequency: Float,
)

data class ContinuousPattern(
  val amplitude: List<ValuePoint>,
  val frequency: List<ValuePoint>,
)

/**
 * @param uri absolute file path, `file://` uri, or the name of a resource in `res/raw`.
 *   The format comes from the extension; when none is given the default is `.wav`,
 *   so a bare name like `"beep"` loads `res/raw/beep.wav`.
 * @param volume playback volume from [0-1].
 * @param offset delay applied to audio start relative to haptics, in ms (fallback path only).
 * @param hapticChannels whether the file carries baked haptic channels. When true
 *   (default) the coupled path is used on supported devices, but only for an
 *   **explicit** `.ogg` uri; when false the file is treated as plain audio and
 *   Pulsar's own haptics are always played alongside it. Any non-`.ogg` uri —
 *   including a bare name (which defaults to `.wav`) — uses the fallback regardless.
 */
data class SoundData(
  val uri: String,
  val volume: Float = 1f,
  val offset: Long = 0L,
  val hapticChannels: Boolean = true,
)

data class PatternData(
  val continuousPattern: ContinuousPattern,
  val discretePattern: List<ConfigPoint>,
) {
  constructor(rawContinuousPattern: List<List<List<Float>>> = listOf(listOf(), listOf()), rawDiscretePattern: List<List<Float>> = listOf()) : this(
    continuousPattern = ContinuousPattern(
      amplitude = rawContinuousPattern[0].map { ValuePoint(time = it[0].toLong(), value = it[1]) },
      frequency = rawContinuousPattern[1].map { ValuePoint(time = it[0].toLong(), value = it[1]) }
    ),
    discretePattern = rawDiscretePattern.map { ConfigPoint(time = it[0].toLong(), amplitude = it[1], frequency = it[2]) }
  )
}
