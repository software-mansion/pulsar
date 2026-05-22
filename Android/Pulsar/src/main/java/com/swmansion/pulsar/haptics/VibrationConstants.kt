package com.swmansion.pulsar.haptics

import android.os.VibrationEffect
import androidx.annotation.IntDef

@Target(
    AnnotationTarget.VALUE_PARAMETER,
    AnnotationTarget.FUNCTION,
    AnnotationTarget.LOCAL_VARIABLE
)
@Retention(AnnotationRetention.SOURCE)
@IntDef(
    VibrationEffect.EFFECT_TICK,
    VibrationEffect.EFFECT_CLICK,
    VibrationEffect.EFFECT_HEAVY_CLICK,
    VibrationEffect.EFFECT_DOUBLE_CLICK
)
annotation class SupportedVibrationEffect

@Target(
    AnnotationTarget.VALUE_PARAMETER,
    AnnotationTarget.FUNCTION,
    AnnotationTarget.LOCAL_VARIABLE
)
@Retention(AnnotationRetention.SOURCE)
@IntDef(
    VibrationEffect.Composition.PRIMITIVE_CLICK,
    VibrationEffect.Composition.PRIMITIVE_THUD,
    VibrationEffect.Composition.PRIMITIVE_SPIN,
    VibrationEffect.Composition.PRIMITIVE_QUICK_RISE,
    VibrationEffect.Composition.PRIMITIVE_SLOW_RISE,
    VibrationEffect.Composition.PRIMITIVE_QUICK_FALL,
    VibrationEffect.Composition.PRIMITIVE_TICK,
    VibrationEffect.Composition.PRIMITIVE_LOW_TICK
)
annotation class SupportedVibrationPrimitive
