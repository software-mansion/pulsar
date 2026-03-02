package com.swmansion.pulsar.haptics

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.vibrator.VibratorFrequencyProfile
import android.util.Log
import androidx.core.content.ContextCompat
import com.swmansion.pulsar.types.CompatibilityMode

class HapticEngineWrapper(context: Context) {

    private val vibrationService = context.getSystemService(Vibrator::class.java)
    private var vibrator: Vibrator? = null
    private var initialized = false
    private var isHapticsEnabled = true

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

    fun vibrate(vibrationEffect: VibrationEffect) {
        if (!isHapticsEnabled) {
            return
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrationService.vibrate(vibrationEffect)
        } else {
            Log.w("Pulsar", "Incompatible Android version. Minimal supported version is Android API 26")
        }
    }

    fun enableHaptics(state: Boolean) {
        if (isHapticsEnabled != state) {
            isHapticsEnabled = state
            if (!isHapticsEnabled) {
                stop()
            }
        }
    }

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

    fun getFrequencyProfile() : VibratorFrequencyProfile? {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.BAKLAVA) {
            vibrator?.frequencyProfile
        } else {
            return null
        }
    }

    fun simulateCompatibilityMode(mode: CompatibilityMode) {
        hapticBuilder.simulateCompatibilityMode(mode)
    }

    fun getRealCompatibilityMode(): CompatibilityMode {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.BAKLAVA) {
            if (isFrequencyProfileSupported()) {
                CompatibilityMode.ADVANCED_SUPPORT
            } else {
                CompatibilityMode.STANDARD_SUPPORT
            }
        } else {
            if (isAmplitudeSupported()) {
                CompatibilityMode.LIMITED_SUPPORT
            } else {
                CompatibilityMode.MINIMAL_SUPPORT
            }
        }
    }
}
