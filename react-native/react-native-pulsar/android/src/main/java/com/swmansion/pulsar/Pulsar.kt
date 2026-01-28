package com.swmansion.pulsar

import android.content.Context
import com.swmansion.pulsar.audio.AudioSimulator
import com.swmansion.pulsar.composers.PatternComposer
import com.swmansion.pulsar.composers.RealtimeComposer
import com.swmansion.pulsar.haptics.HapticEngineWrapper
import com.swmansion.pulsar.presets.PresetsWrapper
import com.swmansion.pulsar.types.CompatibilityMode
import com.swmansion.pulsar.types.RealtimeComposerStrategy

class Pulsar(context: Context) {
    private val engine = HapticEngineWrapper(context)
    private val audioSimulator = AudioSimulator(engine.getRealCompatibilityMode())
    private var presets: PresetsWrapper? = null
    private var realtimeComposer: RealtimeComposer? = null

    fun getPresets(): PresetsWrapper {
        if (presets == null) {
            presets = PresetsWrapper(this)
        }
        return presets!!
    }

    fun preloadPresets(presetNames: List<String>) {
        val presets = this.getPresets()
        for (presetName in presetNames) {
            presets.preloadPresetByName(presetName)
        }
    }

    fun enableSound(state: Boolean) {
        audioSimulator.enableSound(state)
    }

    fun enableCache(state: Boolean) {
        this.getPresets().enableCache(state)
    }

    fun clearCache() {
        this.getPresets().resetCache()
    }

    fun getPatternComposer(): PatternComposer {
        return PatternComposer(engine, audioSimulator)
    }

    fun getRealtimeComposer(strategy: RealtimeComposerStrategy = RealtimeComposerStrategy.ENVELOPE): RealtimeComposer {
        if (realtimeComposer == null) {
            realtimeComposer = RealtimeComposer(engine, strategy)
        }
        return realtimeComposer!!
    }

    fun hapticSupport(): CompatibilityMode {
        return engine.getRealCompatibilityMode()
    }

    fun simulateCompatibilityMode(mode: CompatibilityMode) {
        engine.simulateCompatibilityMode(mode)
        audioSimulator.setCompatibilityMode(mode)
    }
}