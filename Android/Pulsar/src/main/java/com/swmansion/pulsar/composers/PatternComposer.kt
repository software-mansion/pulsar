package com.swmansion.pulsar.composers

import android.Manifest
import androidx.annotation.RequiresPermission
import com.swmansion.pulsar.audio.AudioSimulator
import com.swmansion.pulsar.audio.PatternData
import com.swmansion.pulsar.haptics.HapticEngineWrapper
import com.swmansion.pulsar.lines.ContinuousLine
import com.swmansion.pulsar.lines.DiscreteLine

class PatternComposerImpl(
    private val engine: HapticEngineWrapper,
    private val audioSimulator: AudioSimulator
) {
    private val discreteLine = DiscreteLine()
    private val continuousLine = ContinuousLine()
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
        discreteLine.reset()
        continuousLine.reset()

        val intensityCurveLine = continuousLine.intensityCurveLine
        val sharpnessCurveLine = continuousLine.sharpnessCurveLine

        for (discretePoint in hapticsData.discretePattern) {
            discreteLine.addEvent(
                timestamp = discretePoint.time.toDouble(),
                intensity = discretePoint.amplitude,
                sharpness = discretePoint.frequency
            )
        }

        for (intensityPoint in hapticsData.continuesPattern.amplitude) {
            intensityCurveLine.addPoint(time = intensityPoint.time.toDouble(), value = intensityPoint.value)
        }

        for (sharpnessPoint in hapticsData.continuesPattern.frequency) {
            sharpnessCurveLine.addPoint(time = sharpnessPoint.time.toDouble(), value = sharpnessPoint.value)
        }

        if (!intensityCurveLine.isEmpty() && !sharpnessCurveLine.isEmpty()) {
            // Continuous pattern will be handled through vibration patterns
            // Duration is calculated from curve duration
            val duration = maxOf(
                intensityCurveLine.getDuration(),
                sharpnessCurveLine.getDuration()
            )
        }

        if (discreteLine.getEvents.isNotEmpty()) {
            // Discrete events will be triggered at their respective timestamps
        }

        audioBuffer = audioSimulator.parsePattern(hapticsData)
    }

    @RequiresPermission(Manifest.permission.VIBRATE)
    fun playPattern(hapticsData: PatternData) {
        this.parsePattern(hapticsData)
        this.play()
    }

    @RequiresPermission(Manifest.permission.VIBRATE)
    fun play() {
        audioSimulator.play(audioBuffer)

        val discreteEvents = discreteLine.getEvents
        for (event in discreteEvents) {
            val durationMs = 50L
            val amplitude = (event.intensity * 255).toInt().coerceIn(0, 255)

//            engine.vibrate(
//                duration = durationMs,
//                amplitude = amplitude
//            )
        }
    }

    @RequiresPermission(Manifest.permission.VIBRATE)
    fun stop() {
        engine.stop()
    }
}
