package com.swmansion.pulsar.haptics

import android.Manifest
import android.content.Context
import android.os.Build
import android.os.Vibrator
import android.util.Log
import androidx.annotation.RequiresApi
import androidx.annotation.RequiresPermission
import androidx.core.content.ContextCompat
import com.swmansion.pulsar.types.Preset

class HapticEngineWrapper(context: Context) {

    private val vibrationService = context.getSystemService(Vibrator::class.java)
    private var vibrator: Vibrator? = null
    private var initialized: Boolean = false

    private val hapticBuilder = HapticBuilder(vibrationService)

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
    fun playPresetVibration(preset: Preset) {
        val vibrationEffect = hapticBuilder.createVibrationEffect(preset)

        vibrationEffect?.let {
            Log.i(TAG, "Vibrate...")
            vibrationService.vibrate(it)
        }
    }

    fun vibrate() {

    }

    @RequiresPermission(Manifest.permission.VIBRATE)
    fun stop() {
        if (!initialized) {
            return
        }
        vibrator?.cancel()
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
}
