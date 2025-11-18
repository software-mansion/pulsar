package com.swmansion.pulsarapp

import android.content.Context
import android.os.Build
import android.os.Vibrator
import android.util.Log
import androidx.annotation.RequiresApi
import com.swmansion.pulsarapp.types.CreateVibrationEffectProps
import com.swmansion.pulsarapp.types.Preset

const val TAG = "HapticsHandler"
class HapticsHandler(context: Context) {
    private val vibrationService = context.getSystemService(Vibrator::class.java)

    @RequiresApi(Build.VERSION_CODES.O)
    fun playPresetVibration(preset: Preset){
        if(isEnvelopeSupported()){
            logEnvelopeSpecification()
        }
        val vibrationEffect = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.BAKLAVA){
            val props =  CreateVibrationEffectProps(
                vibrationService.frequencyProfile,
                vibrationService.envelopeEffectInfo
            )
            preset.createVibrationEffect(props)
        } else {
            preset.createVibrationEffect()
        }

        vibrationEffect?.let {
            vibrationService.vibrate(it)
        }
    }
    fun isAmplitudeSupported(): Boolean {
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && vibrationService.hasAmplitudeControl()
    }
    fun isEnvelopeSupported(): Boolean {
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.BAKLAVA && vibrationService.areEnvelopeEffectsSupported()
    }
    @RequiresApi(Build.VERSION_CODES.BAKLAVA)
    fun logEnvelopeSpecification(){
        val profile = vibrationService.frequencyProfile
        val minFrequency = profile?.minFrequencyHz
        val maxFrequency = profile?.maxFrequencyHz

        val info = vibrationService.envelopeEffectInfo
        val maxControlPoints = info.maxSize
        val maxControlPointDuration = info.maxControlPointDurationMillis
        val minControlPointDuration = info.minControlPointDurationMillis
        val maxDuration = info.maxDurationMillis

        Log.i(TAG, "Frequency range: $minFrequency - $maxFrequency")
        Log.i(TAG, "Max control points number: $maxControlPoints")
        Log.i(TAG, "Control point duration range: $minControlPointDuration - $maxControlPointDuration")
        Log.i(TAG, "Max duration: $maxDuration")
    }
}