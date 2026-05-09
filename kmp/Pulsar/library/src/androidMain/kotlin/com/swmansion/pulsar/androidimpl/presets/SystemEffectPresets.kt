package com.swmansion.pulsar.kmp.androidimpl.presets

import android.os.Build
import android.os.VibrationEffect
import android.util.Log
import com.swmansion.pulsar.kmp.androidimpl.Pulsar
import com.swmansion.pulsar.kmp.androidimpl.haptics.HapticEngineWrapper
import com.swmansion.pulsar.kmp.androidimpl.types.PatternData
import com.swmansion.pulsar.kmp.androidimpl.types.Preset
import com.swmansion.pulsar.kmp.androidimpl.types.PresetWithName

class SystemEffectPresets(private val engine: HapticEngineWrapper) {
    fun effectClick() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            playHaptic(VibrationEffect.EFFECT_CLICK)
        }
    }
    fun effectDoubleClick() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            playHaptic(VibrationEffect.EFFECT_DOUBLE_CLICK)
        }
    }
    fun effectTick() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            playHaptic(VibrationEffect.EFFECT_TICK)
        }
    }
    fun effectHeavyClick() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            playHaptic(VibrationEffect.EFFECT_HEAVY_CLICK)
        }
    }

    private fun playHaptic(preset: Int) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            engine.vibrate(VibrationEffect.createPredefined(preset))
        } else {
            Log.w("Pulsar", "Incompatible Android version. System primitive preset unsupported")
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
        super.play()
        systemPresets.effectClick()
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
        super.play()
        systemPresets.effectDoubleClick()
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
        super.play()
        systemPresets.effectTick()
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
        super.play()
        systemPresets.effectHeavyClick()
    }
    companion object: PresetWithName { override val name = "SystemEffectHeavyClick" }
}
