package com.swmansion.pulsarapp.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.composers.PatternComposer
import com.swmansion.pulsar.types.ConfigPoint
import com.swmansion.pulsar.types.ContinuousPattern
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.SoundData
import com.swmansion.pulsar.types.ValuePoint

/**
 * Demonstrates audio-synced haptics: the bundled `res/raw/sample_3s.mp3` clip is
 * played through the [PatternComposer] together with a haptic pattern whose
 * discrete beats land on the track's onsets and whose continuous envelope
 * traces its energy.
 *
 * The clip is a plain `.mp3`, so Pulsar plays the audio while generating the
 * haptics alongside it. For perfectly audio-coupled sync, ship an explicit
 * `.ogg` with baked haptic channels and keep `hapticChannels = true` — on a
 * supporting device Pulsar then uses the coupled path.
 */
@Composable
fun AudioHapticsScreen(pulsar: Pulsar?) {
    val composer = remember(pulsar) { pulsar?.getPatternComposer() }

    // Pattern authored to sync with `sample_3s.mp3` (music onset analysis).
    val audioPattern = remember {
        PatternData(
            continuousPattern = ContinuousPattern(
                amplitude = listOf(
                    ValuePoint(time = 0L, value = 1.0f),
                    ValuePoint(time = 209L, value = 0.927f),
                    ValuePoint(time = 348L, value = 0.843f),
                    ValuePoint(time = 580L, value = 0.789f),
                    ValuePoint(time = 720L, value = 0.791f),
                    ValuePoint(time = 859L, value = 0.693f),
                    ValuePoint(time = 1022L, value = 0.718f),
                    ValuePoint(time = 1161L, value = 0.665f),
                    ValuePoint(time = 1324L, value = 0.565f),
                    ValuePoint(time = 1463L, value = 0.432f),
                    ValuePoint(time = 1649L, value = 0.201f),
                    ValuePoint(time = 1788L, value = 0.068f),
                    ValuePoint(time = 3181L, value = 0.014f),
                ),
                frequency = listOf(
                    ValuePoint(time = 0L, value = 0.402f),
                    ValuePoint(time = 232L, value = 0.061f),
                    ValuePoint(time = 604L, value = 0.077f),
                    ValuePoint(time = 836L, value = 0.23f),
                    ValuePoint(time = 1068L, value = 0.293f),
                    ValuePoint(time = 1324L, value = 0.346f),
                    ValuePoint(time = 1625L, value = 0.437f),
                    ValuePoint(time = 1904L, value = 0.513f),
                    ValuePoint(time = 2206L, value = 0.63f),
                    ValuePoint(time = 2438L, value = 0.822f),
                    ValuePoint(time = 2670L, value = 0.975f),
                    ValuePoint(time = 2902L, value = 0.947f),
                    ValuePoint(time = 3181L, value = 0.861f),
                ),
            ),
            discretePattern = listOf(
                ConfigPoint(time = 70L, amplitude = 0.299f, frequency = 0.159f),
                ConfigPoint(time = 232L, amplitude = 0.401f, frequency = 0.416f),
                ConfigPoint(time = 441L, amplitude = 0.627f, frequency = 0.663f),
                ConfigPoint(time = 627L, amplitude = 0.31f, frequency = 0.607f),
                ConfigPoint(time = 836L, amplitude = 0.792f, frequency = 0.634f),
                ConfigPoint(time = 1022L, amplitude = 0.394f, frequency = 0.379f),
                ConfigPoint(time = 1231L, amplitude = 0.806f, frequency = 0.679f),
                ConfigPoint(time = 1440L, amplitude = 0.612f, frequency = 0.525f),
                ConfigPoint(time = 1649L, amplitude = 0.232f, frequency = 0.767f),
                ConfigPoint(time = 2020L, amplitude = 0.239f, frequency = 0.625f),
                ConfigPoint(time = 2438L, amplitude = 0.385f, frequency = 0.743f),
                ConfigPoint(time = 2624L, amplitude = 0.226f, frequency = 0.468f),
                ConfigPoint(time = 2833L, amplitude = 0.446f, frequency = 0.733f),
            ),
        )
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .fillMaxHeight()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text(
            "Audio-synced haptics",
            fontSize = 24.sp,
            modifier = Modifier.padding(bottom = 4.dp)
        )
        Text(
            "A 3-second music clip played through the pattern composer, with " +
                "haptics authored to land on the beat.",
            fontSize = 14.sp
        )
        Text(
            "sample_3s.mp3 — 13 discrete beats + a continuous energy envelope",
            fontSize = 13.sp,
            modifier = Modifier.padding(top = 8.dp)
        )

        Button(
            onClick = {
                composer?.parsePatternWithSound(
                    audioPattern,
                    SoundData(uri = "sample_3s.mp3", volume = 1f),
                )
                composer?.play()
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("▶ Play with haptics")
        }

        OutlinedButton(
            onClick = { composer?.stop() },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("■ Stop")
        }

        Text(
            "The clip is attached via parsePatternWithSound(), so audio and " +
                "haptics play on a shared clock — no manual scheduling.",
            fontSize = 12.sp,
            modifier = Modifier.padding(top = 8.dp)
        )
    }
}
