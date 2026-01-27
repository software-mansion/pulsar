package com.swmansion.pulsar

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = PulsarModule.NAME)
class PulsarModule(reactContext: ReactApplicationContext) :
  NativeRNPulsarSpec(reactContext) {
  override fun Pulsar_play(name: String?) {
    TODO("Not yet implemented")
  }

  override fun Pulsar_enableSound(state: Boolean) {
    TODO("Not yet implemented")
  }

  override fun Pulsar_enableCache(state: Boolean) {
    TODO("Not yet implemented")
  }

  override fun Pulsar_clearCache(state: Boolean) {
    TODO("Not yet implemented")
  }

  override fun Pulsar_preloadPresets(presetNames: ReadableArray?) {
    TODO("Not yet implemented")
  }

  override fun RealtimeComposer_update(amplitude: Double, frequency: Double) {
    TODO("Not yet implemented")
  }

  override fun RealtimeComposer_stop() {
    TODO("Not yet implemented")
  }

  override fun RealtimeComposer_isActive(): Boolean {
    TODO("Not yet implemented")
  }

  override fun RealtimeComposer_playDiscrete(amplitude: Double, frequency: Double) {
    TODO("Not yet implemented")
  }

  override fun PatternComposer_parsePattern(data: ReadableMap?): Double {
    TODO("Not yet implemented")
  }

  override fun PatternComposer_play(patternId: Double) {
    TODO("Not yet implemented")
  }

  override fun PatternComposer_release(patternId: Double) {
    TODO("Not yet implemented")
  }

  companion object {
    const val NAME = "Pulsar"
  }
}
