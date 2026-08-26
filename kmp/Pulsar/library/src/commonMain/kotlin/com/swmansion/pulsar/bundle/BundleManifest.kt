package com.swmansion.pulsar.kmp.bundle

import com.swmansion.pulsar.kmp.ConfigPoint
import com.swmansion.pulsar.kmp.ContinuousPattern
import com.swmansion.pulsar.kmp.PatternData
import com.swmansion.pulsar.kmp.ValuePoint
import kotlinx.serialization.Serializable

// Codable mirror of manifest.json.

@Serializable
internal data class BundleManifest(
    val schema: String,
    val generator: String? = null,
    val id: String,
    val name: String,
    val revision: Int? = null,
    val hash: String? = null,
    val presets: List<PresetEntry>,
)

@Serializable
internal data class PresetEntry(
    val id: String,
    val name: String,
    val duration: Double? = null,
    val haptics: String,
    val audio: AudioRef? = null,
    val animation: AnimationRef? = null,
)

@Serializable
internal data class AudioRef(val src: String, val volume: Float? = null, val offset: Double? = null)

@Serializable
internal data class AnimationRef(val src: String, val frameRate: Double? = null, val totalFrames: Int? = null)

@Serializable
internal data class ValuePointDto(val time: Double, val value: Float)

@Serializable
internal data class ConfigPointDto(val time: Double, val amplitude: Float, val frequency: Float)

@Serializable
internal data class ContinuousDto(val amplitude: List<ValuePointDto>, val frequency: List<ValuePointDto>)

@Serializable
internal data class DevicePatternDto(
    val continuousPattern: ContinuousDto,
    val discretePattern: List<ConfigPointDto>,
) {
    fun toPatternData(): PatternData = PatternData(
        continuousPattern = ContinuousPattern(
            amplitude = continuousPattern.amplitude.map { ValuePoint(it.time.toLong(), it.value) },
            frequency = continuousPattern.frequency.map { ValuePoint(it.time.toLong(), it.value) },
        ),
        discretePattern = discretePattern.map { ConfigPoint(it.time.toLong(), it.amplitude, it.frequency) },
    )
}
