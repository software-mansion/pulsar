package com.swmansion.pulsar

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule
import com.swmansion.pulsar.composers.PatternComposer
import com.swmansion.pulsar.composers.RealtimeComposer
import com.swmansion.pulsar.types.CompatibilityMode
import com.swmansion.pulsar.types.ConfigPoint
import com.swmansion.pulsar.types.ContinuousPattern
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.ValuePoint

@ReactModule(name = PulsarModule.NAME)
class PulsarModule(reactContext: ReactApplicationContext) :
  NativeRNPulsarSpec(reactContext) {
  
  private val pulsar: Pulsar = Pulsar(reactContext)
  private val realtimeComposer: RealtimeComposer = pulsar.getRealtimeComposer()
  private var nextId: Int = 1
  private val patternComposersRegistry: MutableMap<Int, PatternComposer> = mutableMapOf()

  // Pulsar -----------------------------------------------------------------

  override fun Pulsar_play(name: String?) {
    name?.let {
      pulsar.getPresets().getByName(it)?.play()
    }
  }

  override fun Pulsar_preloadPresets(presetNames: ReadableArray?) {
    presetNames?.let {
      val names = mutableListOf<String>()
      for (i in 0 until it.size()) {
        it.getString(i)?.let { name -> names.add(name) }
      }
      pulsar.preloadPresets(names)
    }
  }

  override fun Pulsar_hapticSupport(): Double {
    val hapticSupport = pulsar.hapticSupport()
    return when (hapticSupport) {
        CompatibilityMode.NO_SUPPORT -> { 0.toDouble() }
        CompatibilityMode.MINIMAL_SUPPORT -> { 1.toDouble() }
        CompatibilityMode.LIMITED_SUPPORT -> { 2.toDouble() }
        CompatibilityMode.STANDARD_SUPPORT -> { 3.toDouble() }
        else -> { 4.toDouble() }
    }
  }

  override fun Pulsar_enableSound(state: Boolean) {
    pulsar.enableSound(state)
  }

  override fun Pulsar_enableCache(state: Boolean) {
    pulsar.enableCache(state)
  }

  override fun Pulsar_clearCache(state: Boolean) {
    if (state) {
      pulsar.clearCache()
    }
  }

  // PatternComposer -----------------------------------------------------------------

  private fun patternDataFromJSPattern(data: ReadableMap): PatternData {
    val continuousPatternMap = data.getMap("continuousPattern")
    val discretePatternArray = data.getArray("discretePattern")

    // Parse amplitude points
    val amplitudePoints = mutableListOf<ValuePoint>()
    continuousPatternMap?.getArray("amplitude")?.let { amplitudeArray ->
      for (i in 0 until amplitudeArray.size()) {
        amplitudeArray.getMap(i)?.let { point ->
          amplitudePoints.add(
            ValuePoint(
              time = point.getDouble("time").toFloat(),
              value = point.getDouble("value").toFloat()
            )
          )
        }
      }
    }

    // Parse frequency points
    val frequencyPoints = mutableListOf<ValuePoint>()
    continuousPatternMap?.getArray("frequency")?.let { frequencyArray ->
      for (i in 0 until frequencyArray.size()) {
        frequencyArray.getMap(i)?.let { point ->
          frequencyPoints.add(
            ValuePoint(
              time = point.getDouble("time").toFloat(),
              value = point.getDouble("value").toFloat()
            )
          )
        }
      }
    }

    val continuousPattern = ContinuousPattern(
      amplitude = amplitudePoints,
      frequency = frequencyPoints
    )

    // Parse discrete pattern points
    val discretePoints = mutableListOf<ConfigPoint>()
    discretePatternArray?.let { array ->
      for (i in 0 until array.size()) {
        array.getMap(i)?.let { point ->
          discretePoints.add(
            ConfigPoint(
              time = point.getDouble("time").toFloat(),
              amplitude = point.getDouble("amplitude").toFloat(),
              frequency = point.getDouble("frequency").toFloat()
            )
          )
        }
      }
    }

    return PatternData(
      continuousPattern = continuousPattern,
      discretePattern = discretePoints
    )
  }

  override fun PatternComposer_parsePattern(data: ReadableMap?): Double {
    val patternComposer = pulsar.getPatternComposer()
    
    data?.let {
      val patternData = patternDataFromJSPattern(it)
      patternComposer.parsePattern(patternData)
    }

    val currentId = nextId
    nextId++
    patternComposersRegistry[currentId] = patternComposer
    return currentId.toDouble()
  }

  override fun PatternComposer_play(patternId: Double) {
    patternComposersRegistry[patternId.toInt()]?.play()
  }

  override fun PatternComposer_release(patternId: Double) {
    patternComposersRegistry.remove(patternId.toInt())
  }

  // RealtimeComposer -----------------------------------------------------------------

  override fun RealtimeComposer_update(amplitude: Double, frequency: Double) {
    realtimeComposer.update(amplitude.toFloat(), frequency.toFloat())
  }

  override fun RealtimeComposer_playDiscrete(amplitude: Double, frequency: Double) {
    realtimeComposer.playDiscrete(amplitude.toFloat(), frequency.toFloat())
  }

  override fun RealtimeComposer_stop() {
    realtimeComposer.stop()
  }

  override fun RealtimeComposer_isActive(): Boolean {
    return realtimeComposer.isActive()
  }

  companion object {
    const val NAME = "RNPulsar"
  }
}
