package com.swmansion.pulsar.kmp

import android.content.Context
import com.swmansion.pulsar.kmp.androidimpl.Pulsar as AndroidPulsar
import com.swmansion.pulsar.kmp.androidimpl.composers.PatternComposer as AndroidPatternComposer
import com.swmansion.pulsar.kmp.androidimpl.presets.PresetsWrapper as AndroidPresetsWrapper
import com.swmansion.pulsar.kmp.androidimpl.types.PatternData as AndroidPatternData
import com.swmansion.pulsar.kmp.androidimpl.types.ContinuousPattern as AndroidContinuousPattern
import com.swmansion.pulsar.kmp.androidimpl.types.ConfigPoint as AndroidConfigPoint
import com.swmansion.pulsar.kmp.androidimpl.types.ValuePoint as AndroidValuePoint
import com.swmansion.pulsar.kmp.androidimpl.types.RealtimeComposable as AndroidRealtimeComposer

fun registerAndroidPulsarFactory(context: Context) {
    Pulsar.registerFactory(AndroidPulsarFactory(context))
}

class AndroidPulsarFactory(
    private val context: Context,
) : PulsarPlatformFactory {
    override fun createPulsar(): PulsarPlatformHandle = AndroidPulsarHandle(AndroidPulsar(context))
}

private class AndroidPulsarHandle(
    private val nativePulsar: AndroidPulsar,
) : PulsarPlatformHandle {
    private val presetsHandle by lazy { AndroidPresetsHandle(nativePulsar.getPresets()) }
    private val patternComposerHandle by lazy { AndroidPatternComposerHandle(nativePulsar.getPatternComposer()) }
    private val realtimeComposerHandle by lazy { AndroidRealtimeComposerHandle(nativePulsar.getRealtimeComposer()) }

    override fun presets(): PulsarPresetsHandle = presetsHandle

    override fun patternComposer(): PatternComposerHandle = patternComposerHandle

    override fun realtimeComposer(): RealtimeComposerHandle = realtimeComposerHandle

    override fun preloadPreset(name: String) {
        nativePulsar.preloadPresets(listOf(name))
    }

    override fun enableHaptics(state: Boolean) {
        nativePulsar.enableHaptics(state)
    }

    override fun enableSound(state: Boolean) {
        nativePulsar.enableSound(state)
    }

    override fun enableCache(state: Boolean) {
        nativePulsar.enableCache(state)
    }

    override fun clearCache() {
        nativePulsar.clearCache()
    }

    override fun stopHaptics() {
        nativePulsar.stopHaptics()
    }

    override fun shutDownEngine() {
        nativePulsar.stopHaptics()
    }

    override fun isHapticsEnabled(): Boolean = true

    override fun isHapticsSupported(): Boolean = nativePulsar.hapticSupport().name != "NO_SUPPORT"

    override fun canPlayHaptics(): Boolean = isHapticsSupported()
}

private class AndroidPresetsHandle(
    private val presets: AndroidPresetsWrapper,
) : PulsarPresetsHandle {
    override fun play(name: String): Boolean {
        val preset = presets.getByName(name) ?: return false
        preset.play()
        return true
    }

    override fun systemImpactLight() = presets.systemImpactLight()

    override fun systemImpactMedium() = presets.systemImpactMedium()

    override fun systemImpactHeavy() = presets.systemImpactHeavy()

    override fun systemImpactSoft() = presets.systemImpactSoft()

    override fun systemImpactRigid() = presets.systemImpactRigid()

    override fun systemNotificationSuccess() = presets.systemNotificationSuccess()

    override fun systemNotificationWarning() = presets.systemNotificationWarning()

    override fun systemNotificationError() = presets.systemNotificationError()

    override fun systemSelection() = presets.systemSelection()
}

private class AndroidPatternComposerHandle(
    private val composer: AndroidPatternComposer,
) : PatternComposerHandle {
    override fun parsePattern(pattern: PatternData) {
        composer.parsePattern(pattern.toAndroidPatternData())
    }

    override fun playPattern(pattern: PatternData) {
        composer.parsePattern(pattern.toAndroidPatternData())
        composer.play()
    }

    override fun play() = composer.play()

    override fun playAudioOnly() = composer.playAudioOnly()

    override fun stop() = composer.stop()
}

private class AndroidRealtimeComposerHandle(
    private val composer: AndroidRealtimeComposer,
) : RealtimeComposerHandle {
    override fun set(amplitude: Float, frequency: Float) {
        composer.set(amplitude, frequency)
    }

    override fun playDiscrete(amplitude: Float, frequency: Float) {
        composer.playDiscrete(amplitude, frequency)
    }

    override fun stop() {
        composer.stop()
    }

    override fun isActive(): Boolean = composer.isActive()
}

private fun PatternData.toAndroidPatternData(): AndroidPatternData {
    return AndroidPatternData(
        continuousPattern = AndroidContinuousPattern(
            amplitude = continuousPattern.amplitude.map { AndroidValuePoint(time = it.time, value = it.value) },
            frequency = continuousPattern.frequency.map { AndroidValuePoint(time = it.time, value = it.value) },
        ),
        discretePattern = discretePattern.map {
            AndroidConfigPoint(time = it.time, amplitude = it.amplitude, frequency = it.frequency)
        },
    )
}
