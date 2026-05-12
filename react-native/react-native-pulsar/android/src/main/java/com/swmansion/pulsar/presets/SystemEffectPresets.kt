package com.swmansion.pulsar.presets

import android.os.Build
import android.os.VibrationEffect
import android.util.Log
import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.haptics.HapticEngineWrapper
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class SystemEffectPresets(private val engine: HapticEngineWrapper) {
    fun effectClick(): Boolean = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        playHaptic(VibrationEffect.EFFECT_CLICK)
    } else {
        false
    }
    fun effectDoubleClick(): Boolean = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        playHaptic(VibrationEffect.EFFECT_DOUBLE_CLICK)
    } else {
        false
    }
    fun effectTick(): Boolean = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        playHaptic(VibrationEffect.EFFECT_TICK)
    } else {
        false
    }
    fun effectHeavyClick(): Boolean = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        playHaptic(VibrationEffect.EFFECT_HEAVY_CLICK)
    } else {
        false
    }

    private fun playHaptic(preset: Int): Boolean {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            if (!engine.areEffectsSupported(preset)) {
                return false
            }
            engine.vibrate(VibrationEffect.createPredefined(preset))
            return true
        } else {
            Log.w("Pulsar", "Incompatible Android version. System primitive preset unsupported")
            return false
        }
    }
}

class SystemEffectClickPreset(haptics: Pulsar, private val systemPresets: SystemEffectPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawContinuousPattern = listOf(
                listOf(),
                listOf(),
            ),
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.65f, 0.85f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        playSystemOrFallback { systemPresets.effectClick() }
    }
    companion object: PresetWithName { override val name = "SystemEffectClick" }
}

class SystemEffectDoubleClickPreset(haptics: Pulsar, private val systemPresets: SystemEffectPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawContinuousPattern = listOf(
                listOf(),
                listOf(),
            ),
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.81f, 0.61f),
                listOf(120.0f, 0.7f, 0.35f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        playSystemOrFallback { systemPresets.effectDoubleClick() }
    }
    companion object: PresetWithName { override val name = "SystemEffectDoubleClick" }
}

class SystemEffectTickPreset(haptics: Pulsar, private val systemPresets: SystemEffectPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawContinuousPattern = listOf(
                listOf(),
                listOf(),
            ),
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.2f, 0.9f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        playSystemOrFallback { systemPresets.effectTick() }
    }
    companion object: PresetWithName { override val name = "SystemEffectTick" }
}

class SystemEffectHeavyClickPreset(haptics: Pulsar, private val systemPresets: SystemEffectPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawContinuousPattern = listOf(
                listOf(),
                listOf(),
            ),
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.9f, 0.45f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        playSystemOrFallback { systemPresets.effectHeavyClick() }
    }
    companion object: PresetWithName { override val name = "SystemEffectHeavyClick" }
}
