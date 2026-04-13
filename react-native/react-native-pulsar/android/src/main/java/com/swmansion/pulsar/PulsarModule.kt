package com.swmansion.pulsar

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule
import com.swmansion.pulsar.composers.PatternComposer
import com.swmansion.pulsar.composers.RealtimeComposer
import com.swmansion.pulsar.types.CompatibilityMode
import com.swmansion.pulsar.types.RealtimeComposerStrategy
import com.swmansion.pulsar.types.ConfigPoint
import com.swmansion.pulsar.types.ContinuousPattern
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.ValuePoint

@ReactModule(name = PulsarModule.NAME)
class PulsarModule(reactContext: ReactApplicationContext) :
  NativeRNPulsarSpec(reactContext) {
  
  private val pulsar: PulsarReactNative = PulsarReactNative(reactContext)
  private var realtimeComposer: RealtimeComposer = pulsar.getRealtimeComposer()
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

  override fun Pulsar_forceHapticsSupportLevel(level: Double) {
    val mode = when (level.toInt()) {
      0 -> CompatibilityMode.NO_SUPPORT
      1 -> CompatibilityMode.LIMITED_SUPPORT
      2 -> CompatibilityMode.MINIMAL_SUPPORT
      3 -> CompatibilityMode.STANDARD_SUPPORT
      4 -> CompatibilityMode.ADVANCED_SUPPORT
      else -> CompatibilityMode.NO_SUPPORT
    }
    pulsar.forceHapticsSupportLevel(mode)
  }

  override fun Pulsar_enableHaptics(state: Boolean) {
    pulsar.enableHaptics(state)
  }

  override fun Pulsar_enableSound(state: Boolean) {
    pulsar.enableSound(state)
  }

  override fun Pulsar_enableCache(state: Boolean) {
    pulsar.enableCache(state)
  }

  override fun Pulsar_clearCache() {
    pulsar.clearCache()
  }

  override fun Pulsar_stopHaptics() {
    pulsar.stopHaptics()
  }

  override fun Pulsar_shutDownEngine() {
    // do nothing on Android
  }

  override fun Pulsar_enableImpulseCompositionMode(state: Boolean) {
    pulsar.enableImpulseCompositionMode(state)
  }

  override fun Pulsar_setRealtimeComposerStrategy(strategy: Double) {
    val strategyEnum = when (strategy.toInt()) {
      0 -> RealtimeComposerStrategy.ENVELOPE
      1 -> RealtimeComposerStrategy.PRIMITIVE_TICK
      2 -> RealtimeComposerStrategy.PRIMITIVE_COMPLEX
      3 -> RealtimeComposerStrategy.ENVELOPE_WITH_DISCRETE_PRIMITIVES
      else -> return
    }
    realtimeComposer = pulsar.getRealtimeComposer(strategyEnum)
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
              time = point.getDouble("time").toLong(),
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
              time = point.getDouble("time").toLong(),
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
              time = point.getDouble("time").toLong(),
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

  override fun PatternComposer_stop(patternId: Double) {
    patternComposersRegistry[patternId.toInt()]?.stop()
  }

  override fun PatternComposer_release(patternId: Double) {
    patternComposersRegistry.remove(patternId.toInt())
  }

  // RealtimeComposer -----------------------------------------------------------------

  override fun RealtimeComposer_set(amplitude: Double, frequency: Double) {
    realtimeComposer.set(amplitude.toFloat(), frequency.toFloat())
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
