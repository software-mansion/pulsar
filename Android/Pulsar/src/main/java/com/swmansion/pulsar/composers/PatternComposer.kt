package com.swmansion.pulsar.composers

import android.os.Build
import android.os.VibrationEffect
import android.util.Log
import com.swmansion.pulsar.audio.AudioHapticPlayer
import com.swmansion.pulsar.audio.AudioSimulator
import com.swmansion.pulsar.haptics.HapticEngineWrapper
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.PatternSeek
import com.swmansion.pulsar.types.SoundData

class PatternComposer(
    private val engine: HapticEngineWrapper,
    private val audioSimulator: AudioSimulator
) {
    companion object {
        private const val TAG = "Pulsar"

        internal fun isOggUri(uri: String): Boolean {
            val extension = uri.substringAfterLast('/').substringAfterLast('.', "").lowercase()
            return extension == "ogg"
        }
    }

    private var vibrationEffect: VibrationEffect? = null
    private var audioBuffer: ByteArray? = null

    private var soundPlayer: AudioHapticPlayer? = null
    private var useCoupledHaptics = false

    /**
     * Parses a pattern for playback. [fromMs] starts it that far into its own timeline: the
     * engine can only play a parsed pattern from zero, so the pattern is re-anchored instead.
     */
    @JvmOverloads
    fun parsePattern(hapticsData0: PatternData, fromMs: Long = 0L) {
        val hapticsData = PatternSeek.patternFrom(hapticsData0, fromMs)
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

    /**
     * As [parsePattern], with a synced audio track. The sound's own `startMs`/`durationMs` are
     * the authored trim window in the file; [fromMs] seeks the whole preset, moving both together.
     */
    @JvmOverloads
    fun parsePatternWithSound(hapticsData: PatternData, sound0: SoundData, fromMs: Long = 0L) {
        parsePattern(hapticsData, fromMs)

        val sound = PatternSeek.soundFrom(sound0, fromMs)
        soundPlayer?.release()

        useCoupledHaptics = sound.hapticChannels && isOggUri(sound.uri) && engine.supportsAudioCoupledHaptics()

        soundPlayer = AudioHapticPlayer(
            context = engine.getContext(),
            sound = sound,
            hapticChannelsMuted = !useCoupledHaptics,
        ).also { it.load() }
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
