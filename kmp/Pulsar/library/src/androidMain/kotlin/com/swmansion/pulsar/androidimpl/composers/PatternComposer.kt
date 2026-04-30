package com.swmansion.pulsar.kmp.androidimpl.composers

import android.os.Build
import android.os.VibrationEffect
import android.util.Log
import com.swmansion.pulsar.kmp.androidimpl.audio.AudioSimulator
import com.swmansion.pulsar.kmp.androidimpl.haptics.HapticEngineWrapper
import com.swmansion.pulsar.kmp.androidimpl.types.PatternData

class PatternComposer(
    private val engine: HapticEngineWrapper,
    private val audioSimulator: AudioSimulator
) {
    companion object {
        private const val TAG = "Pulsar"
    }

    private var vibrationEffect: VibrationEffect? = null
    private var audioBuffer: ByteArray? = null

    fun parsePattern(hapticsData: PatternData) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrationEffect = try {
                engine.getHapticBuilder().createVibrationEffect(hapticsData)
            } catch (_: IllegalArgumentException) {
                val message = "Skipping invalid haptic pattern after Android validation failure: ${summarizePattern(hapticsData)}"
                Log.w(TAG, message)
                null
            }
            if (vibrationEffect == null) {
                val message = "Skipping invalid haptic pattern because it produced no playable vibration effect: ${summarizePattern(hapticsData)}"
                Log.w(TAG, message)
            }
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
        audioSimulator.stop()
        engine.stop()
    }

    private fun summarizePattern(hapticsData: PatternData): String {
        val discreteCount = hapticsData.discretePattern.size
        val amplitudeCount = hapticsData.continuousPattern.amplitude.size
        val frequencyCount = hapticsData.continuousPattern.frequency.size
        val maxDiscreteTime = hapticsData.discretePattern.maxOfOrNull { it.time } ?: -1L
        val maxAmplitudeTime = hapticsData.continuousPattern.amplitude.maxOfOrNull { it.time } ?: -1L
        val maxFrequencyTime = hapticsData.continuousPattern.frequency.maxOfOrNull { it.time } ?: -1L

        return "discreteCount=$discreteCount, amplitudeCount=$amplitudeCount, frequencyCount=$frequencyCount, maxDiscreteTime=$maxDiscreteTime, maxAmplitudeTime=$maxAmplitudeTime, maxFrequencyTime=$maxFrequencyTime"
    }
}
