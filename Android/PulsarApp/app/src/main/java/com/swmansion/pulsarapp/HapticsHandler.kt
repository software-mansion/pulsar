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
import com.swmansion.pulsarapp.types.BarPreset

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

    @RequiresApi(Build.VERSION_CODES.O)
    fun playPresetVibration(preset: BarPreset){
        if(checkVibrationPermission()){
            Log.i(TAG, "permission granted")
            vibrationService.vibrate(preset.vibrationEffect)
        } else {
            Log.i(TAG, "permission not granted")
        }
    }

    fun checkVibrationPermission(): Boolean {
        return ContextCompat.checkSelfPermission(context, Manifest.permission.VIBRATE) ==
            PackageManager.PERMISSION_GRANTED
    }
}