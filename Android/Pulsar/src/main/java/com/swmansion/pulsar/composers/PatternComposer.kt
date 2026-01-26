package com.swmansion.pulsar.composers

import android.Manifest
import android.os.Build
import android.os.VibrationEffect
import androidx.annotation.RequiresPermission
import com.swmansion.pulsar.audio.AudioSimulator
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.haptics.HapticEngineWrapper

class PatternComposer(
    private val engine: HapticEngineWrapper,
    private val audioSimulator: AudioSimulator
) {
    private var vibrationEffect: VibrationEffect? = null
    private var audioBuffer: ByteArray? = null

    fun parseJSON(jsonData: String): PatternData? {
        return null
//        return try {
////            Json.decodeFromString<PatternData>(jsonData)
//        } catch (e: Exception) {
//            Log.e("PatternComposer", "Error parsing JSON: ${e.message}")
//            null
//        }
    }

    fun parsePattern(hapticsData: PatternData) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.BAKLAVA) {
            vibrationEffect = engine.getHapticBuilder().createVibrationEffect(hapticsData)
        }
        audioBuffer = audioSimulator.parsePattern(hapticsData)
    }

    @RequiresPermission(Manifest.permission.VIBRATE)
    fun play() {
        audioSimulator.play(audioBuffer)
        vibrationEffect?.let { engine.vibrate(it) }
    }

    @RequiresPermission(Manifest.permission.VIBRATE)
    fun stop() {
        engine.stop()
    }

}
