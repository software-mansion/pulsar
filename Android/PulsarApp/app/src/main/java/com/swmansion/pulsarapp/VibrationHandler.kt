package com.swmansion.pulsarapp

import android.content.Context
import android.os.Build
import android.os.Vibrator
import android.util.Log
import androidx.annotation.RequiresApi
import com.swmansion.pulsarapp.types.Preset

const val TAG = "VibrationHandler"

class VibrationHandler(context: Context) {
  private val vibrationService = context.getSystemService(Vibrator::class.java)
  private val vibrationBuilder = VibrationBuilder()

  @RequiresApi(Build.VERSION_CODES.O)
  fun playPresetVibration(preset: Preset) {
    val vibrationEffect =
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.BAKLAVA) {
        val props =
          CreateVibrationEffectProps(
            vibrationService.frequencyProfile,
            vibrationService.envelopeEffectInfo,
          )
        vibrationBuilder.createVibrationEffect(preset, props)
      } else {
        vibrationBuilder.createVibrationEffect(preset)
      }

    vibrationEffect?.let {
      Log.i(TAG, "Vibrate...")
      vibrationService.vibrate(it)
    }
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
