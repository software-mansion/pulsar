package com.swmansion.pulsar.kmp

sealed class AdaptivePresetConfig {
    class Function(val play: (PulsarPresets) -> Unit) : AdaptivePresetConfig()
    class Pattern(val pattern: PatternData) : AdaptivePresetConfig()
}

data class AdaptivePreset(
    val ios: AdaptivePresetConfig,
    val android: AdaptivePresetConfig,
)

class AdaptiveHaptics internal constructor(
    private val presets: PulsarPresets,
    private val composer: PatternComposer,
    private val config: AdaptivePresetConfig,
) {
    init {
        if (config is AdaptivePresetConfig.Pattern) {
            composer.parsePattern(config.pattern)
        }
    }

    fun play() {
        when (config) {
            is AdaptivePresetConfig.Function -> config.play(presets)
            is AdaptivePresetConfig.Pattern -> composer.play()
        }
    }

    fun stop() {
        if (config is AdaptivePresetConfig.Pattern) {
            composer.stop()
        }
    }
}
