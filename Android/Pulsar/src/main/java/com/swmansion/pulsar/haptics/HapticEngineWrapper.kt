package com.swmansion.pulsar.haptics

import android.Manifest
import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.vibrator.VibratorEnvelopeEffectInfo
import android.os.vibrator.VibratorFrequencyProfile
import androidx.annotation.RequiresApi
import androidx.annotation.RequiresPermission
import androidx.core.content.ContextCompat

class HapticEngineWrapper(context: Context) {

    private val vibrationService = context.getSystemService(Vibrator::class.java)
    private var vibrator: Vibrator? = null
    private var initialized: Boolean = false

    private val hapticBuilder = HapticBuilder(this)

    init {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            context.let {
                vibrator = ContextCompat.getSystemService(it, Vibrator::class.java)
                if (vibrator?.hasVibrator() == true) {
                    initialized = true
                }
            }
        } else {
            @Suppress("DEPRECATION")
            vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
            if (vibrator?.hasVibrator() == true) {
                initialized = true
            }
        }
    }

    @RequiresApi(Build.VERSION_CODES.O)
    @RequiresPermission(value = "android.permission.VIBRATE")
    fun vibrate(vibrationEffect: VibrationEffect) {
        vibrationService.vibrate(vibrationEffect)
    }

    @RequiresPermission(Manifest.permission.VIBRATE)
    fun stop() {
        if (!initialized) {
            return
        }
        vibrator?.cancel()
    }

    fun getHapticBuilder(): HapticBuilder {
        return hapticBuilder
    }

    fun isAmplitudeSupported(): Boolean {
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && vibrationService.hasAmplitudeControl()
    }

    fun isEnvelopeSupported(): Boolean {
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.BAKLAVA &&
                vibrationService.areEnvelopeEffectsSupported()
    }

    fun isFrequencyProfileSupported(): Boolean {
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.BAKLAVA &&
                vibrationService.frequencyProfile !== null
    }

    @RequiresApi(Build.VERSION_CODES.BAKLAVA)
    fun getEnvelopConfig(): VibratorEnvelopeEffectInfo {
        return vibrationService.envelopeEffectInfo
    }

    @RequiresApi(Build.VERSION_CODES.BAKLAVA)
    fun getFrequencyProfile() : VibratorFrequencyProfile? {
        return vibrator?.frequencyProfile
    }
}
