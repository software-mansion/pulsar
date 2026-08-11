package com.swmansion.pulsarapp.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.lottie.HapticLottieController
import com.swmansion.pulsar.lottie.HapticLottieView
import com.swmansion.pulsar.types.ConfigPoint
import com.swmansion.pulsar.types.ContinuousPattern
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.ValuePoint
import com.swmansion.pulsarapp.R

/**
 * Demonstrates [HapticLottieView] — a drop-in [com.airbnb.lottie.LottieAnimationView]
 * subclass that plays a Pulsar haptic pattern locked to the animation timeline.
 * In the default realtime mode the animation is the master clock, so the haptics
 * follow play / stop / replay and land with the checkmark.
 */
@Composable
fun LottieHapticsScreen(pulsar: Pulsar?) {
    val pattern = remember { verifiedPattern() }
    val controllerRef = remember { arrayOfNulls<HapticLottieController>(1) }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .fillMaxHeight()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text("Lottie + Haptics", fontSize = 24.sp)
        Text(
            "A checkmark animation with haptics locked to its timeline — the " +
                "animation drives the haptics (realtime mode).",
            fontSize = 14.sp
        )

        AndroidView(
            modifier = Modifier
                .fillMaxWidth()
                .height(220.dp),
            factory = { ctx ->
                HapticLottieView(ctx).apply {
                    setAnimation(R.raw.verified)
                    repeatCount = 0
                    if (pulsar != null) {
                        val controller = setHaptics(pulsar, pattern)
                        controllerRef[0] = controller
                        controller.play()
                    } else {
                        playAnimation()
                    }
                }
            }
        )

        Button(
            onClick = { controllerRef[0]?.play() },
            enabled = pulsar != null,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("▶ Replay")
        }
        OutlinedButton(
            onClick = { controllerRef[0]?.stop() },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("■ Stop")
        }
    }
}

// Pattern spanning the ~2.4s "verified" animation: a gentle swell that resolves
// into a firm confirming tap as the checkmark snaps in.
private fun verifiedPattern(): PatternData {
    return PatternData(
        continuousPattern = ContinuousPattern(
            amplitude = listOf(
                ValuePoint(time = 0L, value = 0.0f),
                ValuePoint(time = 300L, value = 0.25f),
                ValuePoint(time = 900L, value = 0.45f),
                ValuePoint(time = 1500L, value = 0.65f),
                ValuePoint(time = 1850L, value = 0.9f),
                ValuePoint(time = 2000L, value = 0.15f),
                ValuePoint(time = 2436L, value = 0.0f),
            ),
            frequency = listOf(
                ValuePoint(time = 0L, value = 0.35f),
                ValuePoint(time = 900L, value = 0.5f),
                ValuePoint(time = 1850L, value = 0.9f),
                ValuePoint(time = 2436L, value = 0.55f),
            ),
        ),
        discretePattern = listOf(
            ConfigPoint(time = 100L, amplitude = 0.35f, frequency = 0.55f),
            ConfigPoint(time = 1500L, amplitude = 0.6f, frequency = 0.7f),
            ConfigPoint(time = 1850L, amplitude = 1.0f, frequency = 0.9f),
            ConfigPoint(time = 2050L, amplitude = 0.45f, frequency = 0.6f),
        ),
    )
}
