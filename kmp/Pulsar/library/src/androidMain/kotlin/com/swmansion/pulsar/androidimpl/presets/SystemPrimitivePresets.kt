package com.swmansion.pulsar.androidimpl.presets

import android.os.Build
import android.os.VibrationEffect
import android.util.Log
import com.swmansion.pulsar.androidimpl.Pulsar
import com.swmansion.pulsar.androidimpl.haptics.HapticEngineWrapper
import com.swmansion.pulsar.androidimpl.types.PatternData
import com.swmansion.pulsar.androidimpl.types.Preset
import com.swmansion.pulsar.androidimpl.types.PresetWithName

class SystemPrimitivePresets(private val engine: HapticEngineWrapper) {
    fun primitiveClick() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            playHaptic(VibrationEffect.Composition.PRIMITIVE_CLICK)
        }
    }
    fun primitiveThud() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            playHaptic(VibrationEffect.Composition.PRIMITIVE_THUD)
        }
    }
    fun primitiveSpin() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            playHaptic(VibrationEffect.Composition.PRIMITIVE_SPIN)
        }
    }
    fun primitiveQuickRise() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            playHaptic(VibrationEffect.Composition.PRIMITIVE_QUICK_RISE)
        }
    }
    fun primitiveSlowRise() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            playHaptic(VibrationEffect.Composition.PRIMITIVE_SLOW_RISE)
        }
    }
    fun primitiveQuickFall() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            playHaptic(VibrationEffect.Composition.PRIMITIVE_QUICK_FALL)
        }
    }
    fun primitiveTick() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            playHaptic(VibrationEffect.Composition.PRIMITIVE_TICK)
        }
    }
    fun primitiveLowTick() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            playHaptic(VibrationEffect.Composition.PRIMITIVE_LOW_TICK)
        }
    }

    private fun playHaptic(primitive: Int) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            engine.vibrate(
                VibrationEffect.startComposition()
                    .addPrimitive(primitive)
                    .compose()
            )
        } else {
            Log.w("Pulsar", "Incompatible Android version. System primitive preset unsupported")
        }
    }
}

class SystemPrimitiveClickPreset(haptics: Pulsar, private val systemPresets: SystemPrimitivePresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawContinuousPattern = listOf(
                listOf(),
                listOf(),
            ),
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.9f, 0.5f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        super.play()
        systemPresets.primitiveClick()
    }
    companion object: PresetWithName { override val name = "SystemPrimitiveClick" }
}

class SystemPrimitiveThudPreset(haptics: Pulsar, private val systemPresets: SystemPrimitivePresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawContinuousPattern = listOf(
                listOf(listOf(0.0f, 0.2f), listOf(300.0f, 0.0f)),
                listOf(listOf(0.0f, 0.25f), listOf(300.0f, 0.17f)),
            ),
            rawDiscretePattern = listOf(
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        super.play()
        systemPresets.primitiveThud()
    }
    companion object: PresetWithName { override val name = "SystemPrimitiveThud" }
}

class SystemPrimitiveSpinPreset(haptics: Pulsar, private val systemPresets: SystemPrimitivePresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawContinuousPattern = listOf(
                listOf(listOf(0.0f, 0.0f), listOf(75.0f, 0.5f), listOf(150.0f, 0.0f)),
                listOf(listOf(0.0f, 0.33f), listOf(75.0f, 0.17f), listOf(150.0f, 0.25f)),
            ),
            rawDiscretePattern = listOf(
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        super.play()
        systemPresets.primitiveSpin()
    }
    companion object: PresetWithName { override val name = "SystemPrimitiveSpin" }
}

class SystemPrimitiveQuickRisePreset(haptics: Pulsar, private val systemPresets: SystemPrimitivePresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawContinuousPattern = listOf(
                listOf(listOf(0.0f, 0.0f), listOf(150.0f, 0.5f), listOf(155.0f, 0.0f)),
                listOf(listOf(0.0f, 0.25f), listOf(150.0f, 0.33f)),
            ),
            rawDiscretePattern = listOf(
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        super.play()
        systemPresets.primitiveQuickRise()
    }
    companion object: PresetWithName { override val name = "SystemPrimitiveQuickRise" }
}

class SystemPrimitiveSlowRisePreset(haptics: Pulsar, private val systemPresets: SystemPrimitivePresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawContinuousPattern = listOf(
                listOf(listOf(0.0f, 0.0f), listOf(500.0f, 0.5f), listOf(505.0f, 0.0f)),
                listOf(listOf(0.0f, 0.25f), listOf(500.0f, 0.33f)),
            ),
            rawDiscretePattern = listOf(
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        super.play()
        systemPresets.primitiveSlowRise()
    }
    companion object: PresetWithName { override val name = "SystemPrimitiveSlowRise" }
}

class SystemPrimitiveQuickFallPreset(haptics: Pulsar, private val systemPresets: SystemPrimitivePresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawContinuousPattern = listOf(
                listOf(listOf(0.0f, 0.65f), listOf(100.0f, 0.0f)),
                listOf(listOf(0.0f, 1.0f), listOf(100.0f, 0.5f)),
            ),
            rawDiscretePattern = listOf(
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        super.play()
        systemPresets.primitiveQuickFall()
    }
    companion object: PresetWithName { override val name = "SystemPrimitiveQuickFall" }
}

class SystemPrimitiveTickPreset(haptics: Pulsar, private val systemPresets: SystemPrimitivePresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawContinuousPattern = listOf(
                listOf(),
                listOf(),
            ),
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.65f, 1.0f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        super.play()
        systemPresets.primitiveTick()
    }
    companion object: PresetWithName { override val name = "SystemPrimitiveTick" }
}

class SystemPrimitiveLowTickPreset(haptics: Pulsar, private val systemPresets: SystemPrimitivePresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawContinuousPattern = listOf(
                listOf(),
                listOf(),
            ),
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.2f, 0.3f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        super.play()
        systemPresets.primitiveLowTick()
    }
    companion object: PresetWithName { override val name = "SystemPrimitiveLowTick" }
}
