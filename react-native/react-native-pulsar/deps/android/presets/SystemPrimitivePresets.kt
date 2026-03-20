package com.swmansion.pulsar.presets

import android.os.Build
import android.os.VibrationEffect
import android.util.Log
import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.haptics.HapticEngineWrapper
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class SystemPrimitivePresets(private val engine: HapticEngineWrapper) {
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
            Log.w("Pulsar", "Incompatible Android version. System primitive presset unsupported")
        }
    }
}

class SystemEffectClickPreset(haptics: Pulsar, private val systemPresets: SystemPrimitivePresets) : Preset,
    Player(
        haptics,
        PatternData(
            rawDiscretePattern = listOf(
                listOf(0f, 0.65f, 0.85f),
            ),
        ),
        true
    ) {
    override fun play() {
        super.play()
        systemPresets.effectClick()
    }
    companion object: PresetWithName { override val name = "SystemEffectClickPreset" }
}

class SystemDoubleClickPreset(haptics: Pulsar, private val systemPresets: SystemPrimitivePresets) : Preset,
    Player(
        haptics,
        PatternData(
            rawDiscretePattern = listOf(
                listOf(0f,    0.65f, 0.85f),
                listOf(120f,  0.55f, 0.8f),
            ),
        ),
        true
    ) {
    override fun play() {
        super.play()
        systemPresets.effectDoubleClick()
    }
    companion object: PresetWithName { override val name = "SystemDoubleClickPreset" }
}

class SystemTickPreset(haptics: Pulsar, private val systemPresets: SystemPrimitivePresets) : Preset,
    Player(
        haptics,
        PatternData(
            rawDiscretePattern = listOf(
                listOf(0f, 0.2f, 0.9f),
            ),
        ),
        true
    ) {
    override fun play() {
        super.play()
        systemPresets.effectTick()
    }
    companion object: PresetWithName { override val name = "SystemTickPreset" }
}

class SystemHeavyClickPreset(haptics: Pulsar, private val systemPresets: SystemPrimitivePresets) : Preset,
    Player(
        haptics,
        PatternData(
            rawDiscretePattern = listOf(
                listOf(0f, 0.9f, 0.45f),
            ),
        ),
        true
    ) {
    override fun play() {
        super.play()
        systemPresets.effectHeavyClick()
    }
    companion object: PresetWithName { override val name = "SystemHeavyClickPreset" }
}
