package com.swmansion.pulsar

import android.content.Context
import com.swmansion.pulsar.audio.AudioSimulator
import com.swmansion.pulsar.composers.PatternComposer
import com.swmansion.pulsar.composers.RealtimeComposer
import com.swmansion.pulsar.haptics.HapticEngineWrapper
import com.swmansion.pulsar.presets.PresetsWrapper

class Pulsar(context: Context) {
    val engine = HapticEngineWrapper(context)
    private val audioSimulator = AudioSimulator()
    private var presets: PresetsWrapper? = null
    private val realtimeComposer: RealtimeComposer = RealtimeComposer(engine)

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

    fun getRealtimeComposer(): RealtimeComposer {
        return realtimeComposer
    }
}