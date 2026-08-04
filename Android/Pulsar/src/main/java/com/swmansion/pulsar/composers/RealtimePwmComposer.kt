package com.swmansion.pulsar.composers

import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.VibrationEffect
import androidx.annotation.RequiresApi
import com.swmansion.pulsar.haptics.HapticEngineWrapper
import com.swmansion.pulsar.haptics.PwmHapticsGenerator
import com.swmansion.pulsar.types.ConfigPoint
import com.swmansion.pulsar.types.RealtimeComposable
import java.util.concurrent.atomic.AtomicBoolean

class RealtimePwmComposer(
    private val engine: HapticEngineWrapper,
) : RealtimeComposable {

    private val pwm: PwmHapticsGenerator =
        PwmHapticsGenerator.forActuator(engine.getMinControlPointDurationMillis())

    private val isPlaying = AtomicBoolean(false)
    @Volatile private var currentAmplitude = 0.0f
    @Volatile private var currentFrequency = 0.0f

    private val handler = Handler(Looper.getMainLooper())
    private val loopRunnable = Runnable { loop() }

    override fun set(amplitude: Float, frequency: Float) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return
        }

        val amp = amplitude.coerceIn(0f, 1f)
        if (amp <= 0f) {
            stop()
            return
        }

        // Only mutate the target; never vibrate here, or a fast stream of set() calls would restart
        // the pulse mid-flight and never reach the off gap.
        currentAmplitude = amp
        currentFrequency = frequency.coerceIn(0f, 1f)

        if (!isPlaying.getAndSet(true)) {
            loop()
        }
    }

    override fun playDiscrete(amplitude: Float, frequency: Float) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return
        }
        val timings = pwm.buildImpulseTimings(
            listOf(ConfigPoint(time = 0L, amplitude = amplitude, frequency = frequency)),
        ) ?: return
        engine.vibrate(VibrationEffect.createWaveform(timings, -1))
    }

    override fun stop() {
        if (!isPlaying.compareAndSet(true, false)) return
        handler.removeCallbacks(loopRunnable)
        currentAmplitude = 0.0f
        currentFrequency = 0.0f
        engine.stop()
    }

    override fun isActive(): Boolean = isPlaying.get()

    private fun loop() {
        if (!isPlaying.get() || Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return
        }

        val shot = pwm.resolveShotWidth(currentAmplitude, capMs = pwm.maxPulseMs)
        val pause = pwm.resolvePauseWidth(currentFrequency)

        vibratePulse(shot)
        // Next pulse a full period later: the motor is on for `shot`, then idle for `pause`.
        handler.postDelayed(loopRunnable, shot + pause)
    }

    @RequiresApi(Build.VERSION_CODES.O)
    private fun vibratePulse(durationMs: Long) {
        engine.vibrate(VibrationEffect.createOneShot(durationMs, VibrationEffect.DEFAULT_AMPLITUDE))
    }
}
