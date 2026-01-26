package com.swmansion.pulsar.composers

import android.Manifest
import android.os.Build
import android.os.VibrationEffect
import androidx.annotation.RequiresApi
import androidx.annotation.RequiresPermission
import com.swmansion.pulsar.audio.AudioSimulator
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.haptics.HapticEngineWrapper
//import com.swmansion.pulsar.haptics.convertImpulsesToBars

class PatternComposerImpl(
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

    @RequiresApi(Build.VERSION_CODES.BAKLAVA)
    fun parsePattern(hapticsData: PatternData) {
        vibrationEffect = engine.getHapticBuilder().createVibrationEffect(hapticsData)
        audioBuffer = audioSimulator.parsePattern(hapticsData)
    }

    @RequiresApi(Build.VERSION_CODES.BAKLAVA)
    @RequiresPermission(Manifest.permission.VIBRATE)
    fun playPattern(hapticsData: PatternData) {
        this.parsePattern(hapticsData)
        this.play()
    }

    @RequiresApi(Build.VERSION_CODES.O)
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
