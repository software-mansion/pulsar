package com.swmansion.pulsar

import android.content.Context
import com.swmansion.pulsar.audio.AudioSimulator
import com.swmansion.pulsar.composers.PatternComposer
import com.swmansion.pulsar.composers.RealtimeComposer
import com.swmansion.pulsar.haptics.HapticEngineWrapper
import com.swmansion.pulsar.presets.PresetsWrapper
import com.swmansion.pulsar.types.CompatibilityMode
import com.swmansion.pulsar.types.RealtimeComposerStrategy

class Pulsar(private var context: Context) {
    private val engine = HapticEngineWrapper(context)
    private val audioSimulator = AudioSimulator(engine.getRealCompatibilityMode())
    private var presets: PresetsWrapper? = null
    private var realtimeComposer: RealtimeComposer? = null

    fun getPresets(): PresetsWrapper {
        if (presets == null) {
            presets = PresetsWrapper(this, context, engine)
        }
        return presets!!
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

    fun forceHapticsSupportLevel(mode: CompatibilityMode) {
        engine.simulateCompatibilityMode(mode)
        audioSimulator.setCompatibilityMode(mode)
    }

    fun preloadPresets(presetNames: List<String>) {
        this.getPresets().preloadPresetByNames(presetNames)
    }

    fun enableHaptics(state: Boolean) {
        engine.enableHaptics(state)
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

    fun stopHaptics() {
        engine.stop()
    }
}