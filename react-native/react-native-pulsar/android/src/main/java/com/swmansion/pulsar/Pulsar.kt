package com.swmansion.pulsar

import android.app.Activity
import android.content.Context
import com.swmansion.pulsar.audio.AudioSimulator
import com.swmansion.pulsar.composers.PatternComposer
import com.swmansion.pulsar.composers.RealtimeComposer
import com.swmansion.pulsar.haptics.HapticEngineWrapper
import com.swmansion.pulsar.presets.PresetsWrapper
import com.swmansion.pulsar.types.CompatibilityMode
import com.swmansion.pulsar.types.RealtimeComposerStrategy

open class Pulsar(protected var context: Context) {
    protected val engine = HapticEngineWrapper(context)
    private val audioSimulator = AudioSimulator(hapticSupport())
    protected var _presets: PresetsWrapper? = null
    var realtimeComposerStrategy =
        if (hapticSupport() >= CompatibilityMode.STANDARD_SUPPORT) {
            RealtimeComposerStrategy.ENVELOPE_WITH_DISCRETE_PRIMITIVES
        } else if (hapticSupport() >= CompatibilityMode.LIMITED_SUPPORT) {
            RealtimeComposerStrategy.PRIMITIVE_COMPLEX
        } else {
            RealtimeComposerStrategy.PRIMITIVE_TICK
        }
    private var realtimeComposer: RealtimeComposer? = null

    open fun getPresets(): PresetsWrapper {
        if (_presets == null) {
            _presets = PresetsWrapper(this, context as Activity, engine)
        }
        return _presets!!
    }

    fun getPatternComposer(): PatternComposer {
        return PatternComposer(engine, audioSimulator)
    }

    fun getRealtimeComposer(strategy: RealtimeComposerStrategy? = null): RealtimeComposer {
        if (realtimeComposer == null) {
            val composerStrategy = strategy ?: realtimeComposerStrategy
            realtimeComposer = RealtimeComposer(engine, composerStrategy, hapticSupport())
            realtimeComposerStrategy = composerStrategy
        }
        if (strategy != null && strategy != realtimeComposerStrategy) {
            realtimeComposer = RealtimeComposer(engine, strategy, hapticSupport())
            realtimeComposerStrategy = strategy
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

    fun enableImpulseCompositionMode(state: Boolean) {
        engine.enableImpulseCompositionMode(state)
    }
}