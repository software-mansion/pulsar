package com.swmansion.pulsarapp

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.util.Log
import androidx.annotation.RequiresApi
import androidx.core.content.ContextCompat

const val TAG = "HapticsHandler"

class HapticsHandler(val context: Context) {
    private val vibrationService = context.getSystemService(Vibrator::class.java)

    @RequiresApi(Build.VERSION_CODES.Q)
    fun playPredefinedVibration(){
        if(checkVibrationPermission()){
            Log.i(TAG, "permission granted")

            vibrationService.vibrate(VibrationEffect.createPredefined(VibrationEffect.EFFECT_CLICK))

        } else {
            Log.i(TAG, "permission not granted")
        }
    }

    @RequiresApi(Build.VERSION_CODES.Q)
    fun playWaveformVibration(){
        if(checkVibrationPermission()){
            Log.i(TAG, "permission granted")

            val timings: LongArray = longArrayOf(
                25, 25, 50, 25, 25, 25, 25, 25, 25, 25, 75, 25, 25,
                300, 25, 25, 150, 25, 25, 25
            )
            val amplitudes: IntArray = intArrayOf(
                38, 77, 79, 84, 92, 99, 121, 143, 180, 217, 255, 170, 85,
                0, 85, 170, 255, 170, 85, 0
            )
            val repeatIndex = -1 // Do not repeat.

            vibrationService.vibrate(VibrationEffect.createWaveform(timings, amplitudes, repeatIndex))
        } else {
            Log.i(TAG, "permission not granted")
        }
    }

    fun checkVibrationPermission(): Boolean {
        return ContextCompat.checkSelfPermission(context, Manifest.permission.VIBRATE) ==
            PackageManager.PERMISSION_GRANTED
    }
}