package com.swmansion.pulsar.composers

import android.os.Build
import android.os.VibrationEffect
import android.util.Log
import com.swmansion.pulsar.audio.AudioHapticPlayer
import com.swmansion.pulsar.audio.AudioSimulator
import com.swmansion.pulsar.haptics.HapticEngineWrapper
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.SoundData

class PatternComposer(
    private val engine: HapticEngineWrapper,
    private val audioSimulator: AudioSimulator
) {
    companion object {
        private const val TAG = "Pulsar"
    }

    private var vibrationEffect: VibrationEffect? = null
    private var audioBuffer: ByteArray? = null

    private var soundPlayer: AudioHapticPlayer? = null
    private var useCoupledHaptics = false

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

    fun parsePatternWithSound(hapticsData: PatternData, sound: SoundData) {
        parsePattern(hapticsData)

        soundPlayer?.release()

        val isNonOggFile = isKnownNonOggUri(sound.uri)
        useCoupledHaptics = sound.hapticChannels && !isNonOggFile && engine.supportsAudioCoupledHaptics()

        soundPlayer = AudioHapticPlayer(
            context = engine.getContext(),
            sound = sound,
            hapticChannelsMuted = !useCoupledHaptics,
        ).also { it.load() }
    }

    private fun isKnownNonOggUri(uri: String): Boolean {
        val extension = uri.substringAfterLast('.', "").lowercase()
        return extension.isNotEmpty() && extension != "ogg"
    }

    fun play() {
        val player = soundPlayer
        if (player != null) {
            player.play()
            if (!useCoupledHaptics) {
                vibrationEffect?.let { engine.vibrate(it) }
            }
        } else {
            audioSimulator.play(audioBuffer)
            vibrationEffect?.let { engine.vibrate(it) }
        }
    }

    fun playAudioOnly() {
        val player = soundPlayer
        if (player != null) {
            player.play()
        } else {
            audioSimulator.play(audioBuffer)
        }
    }

    fun stop() {
        soundPlayer?.stop()
        audioSimulator.stop()
        engine.stop()
    }

    fun release() {
        soundPlayer?.release()
        soundPlayer = null
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
