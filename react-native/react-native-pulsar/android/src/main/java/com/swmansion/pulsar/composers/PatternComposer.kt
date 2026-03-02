package com.swmansion.pulsar.composers

import android.os.Build
import android.os.VibrationEffect
import com.swmansion.pulsar.audio.AudioSimulator
import com.swmansion.pulsar.haptics.HapticEngineWrapper
import com.swmansion.pulsar.types.PatternData

class PatternComposer(
    private val engine: HapticEngineWrapper,
    private val audioSimulator: AudioSimulator
) {
    private var vibrationEffect: VibrationEffect? = null
    private var audioBuffer: ByteArray? = null

    fun parsePattern(hapticsData: PatternData) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrationEffect = engine.getHapticBuilder().createVibrationEffect(hapticsData)
        }

        audioBuffer = audioSimulator.parsePattern(hapticsData)
    }

    fun play() {
        audioSimulator.play(audioBuffer)
        vibrationEffect?.let { engine.vibrate(it) }
    }

    fun playAudioOnly() {
        audioSimulator.play(audioBuffer)
    }

    fun stop() {
        engine.stop()
    }

}
