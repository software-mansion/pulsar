package com.swmansion.pulsar

import android.content.Context
import com.swmansion.pulsar.audio.AudioSimulator
import com.swmansion.pulsar.composers.PatternComposerImpl
import com.swmansion.pulsar.composers.RealtimeComposerImpl
import com.swmansion.pulsar.haptics.HapticEngineWrapper
import com.swmansion.pulsar.presets.PresetsWrapper

class Pulsar(context: Context) {
    public val engine = HapticEngineWrapper(context)
    private val audioSimulator = AudioSimulator()
    private var presets: PresetsWrapper? = null
    private val realtimeComposer: RealtimeComposerImpl = RealtimeComposerImpl(engine)

    fun Presets(): PresetsWrapper {
        if (presets == null) {
            presets = PresetsWrapper(this)
        }
        return presets!!
    }

    fun preloadPresets(presetNames: List<String>) {
        val presets = this.Presets()
        for (presetName in presetNames) {
            presets.preloadPresetByName(presetName)
        }
    }

    fun enableSound(state: Boolean) {
        audioSimulator.enableSound(state)
    }

    fun enableCache(state: Boolean) {
        this.Presets().enableCache(state)
    }

    fun clearCache() {
        this.Presets().resetCache()
    }

    fun PatternComposer(): PatternComposerImpl {
        return PatternComposerImpl(engine, audioSimulator)
    }

    fun RealtimeComposer(): RealtimeComposerImpl {
        return realtimeComposer
    }
}