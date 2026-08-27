package com.swmansion.pulsar.kmp.app

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeContentPadding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Slider
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.tooling.preview.Preview
import com.swmansion.pulsar.kmp.ConfigPoint
import com.swmansion.pulsar.kmp.ContinuousPattern
import com.swmansion.pulsar.kmp.PatternData
import com.swmansion.pulsar.kmp.SoundData
import com.swmansion.pulsar.kmp.Pulsar
import com.swmansion.pulsar.kmp.ValuePoint
import com.swmansion.pulsar.kmp.app.bundles.HapticsBundle
import pulsarapp.composeapp.generated.resources.Res
import com.swmansion.pulsar.lottie.HapticLottie
import io.github.alexzhirkevich.compottie.LottieCompositionSpec
import io.github.alexzhirkevich.compottie.animateLottieCompositionAsState
import io.github.alexzhirkevich.compottie.rememberLottieComposition
import io.github.alexzhirkevich.compottie.rememberLottiePainter

@Composable
@Preview
fun App() {
    MaterialTheme {
        val pulsarResult = remember { runCatching { Pulsar.create() } }
        val pulsar = pulsarResult.getOrNull()
        var status by remember {
            mutableStateOf(
                pulsarResult.exceptionOrNull()?.message ?: "Pulsar ready. Trigger a preset, a custom pattern, or realtime haptics."
            )
        }
        var amplitude by remember { mutableFloatStateOf(0.6f) }
        var frequency by remember { mutableFloatStateOf(0.5f) }

        Column(
            modifier = Modifier
                .safeContentPadding()
                .fillMaxSize()
                .padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            horizontalAlignment = Alignment.Start,
        ) {
            Text("Pulsar KMP Demo", style = MaterialTheme.typography.headlineMedium)
            Text(
                if (pulsar == null) {
                    "Factory registration is missing."
                } else if (pulsar.isHapticsSupported()) {
                    "Haptics are supported on this device."
                } else {
                    "Haptics are unavailable on this device."
                },
                style = MaterialTheme.typography.bodyLarge,
            )
            BundleCard(pulsar) { status = it }

            Card(modifier = Modifier.fillMaxWidth()) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    Text("Presets", style = MaterialTheme.typography.titleMedium)
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        Button(
                            onClick = {
                                val played = pulsar?.getPresets()?.play("Hammer") == true
                                status = if (played) "Played Hammer preset." else "Hammer preset is unavailable."
                            },
                            enabled = pulsar != null,
                        ) { Text("Hammer") }
                        Button(
                            onClick = {
                                val played = pulsar?.getPresets()?.play("Spark") == true
                                status = if (played) "Played Spark preset." else "Spark preset is unavailable."
                            },
                            enabled = pulsar != null,
                        ) { Text("Spark") }
                        Button(
                            onClick = {
                                pulsar?.getPresets()?.systemNotificationSuccess()
                                status = "Played system success haptic."
                            },
                            enabled = pulsar != null,
                        ) { Text("Success") }
                    }
                }
            }
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    Text("Pattern Composer", style = MaterialTheme.typography.titleMedium)
                    Button(
                        onClick = {
                            pulsar?.getPatternComposer()?.apply {
                                parsePattern(demoPattern())
                                play()
                            }
                            status = "Played a custom composed haptic pattern."
                        },
                        enabled = pulsar != null,
                    ) {
                        Text("Play custom pattern")
                    }
                    Button(
                        onClick = {
                            // A short sound synchronized with the haptics. A bare name
                            // defaults to `.wav`, so bundle `beep.wav` natively — iOS:
                            // in the app bundle; Android: in `res/raw` (use an explicit
                            // `beep.ogg` with baked haptic channels for coupled sync).
                            // Missing files degrade gracefully to haptics-only.
                            pulsar?.getPatternComposer()?.apply {
                                parsePatternWithSound(demoPattern(), SoundData(uri = "beep"))
                                play()
                            }
                            status = "Played a haptic pattern with a synchronized sound."
                        },
                        enabled = pulsar != null,
                    ) {
                        Text("Play pattern + sound")
                    }
                }
            }
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    Text("Audio-synced Haptics", style = MaterialTheme.typography.titleMedium)
                    Text(
                        "A 3-second music clip (sample_3s.mp3) played through the pattern " +
                            "composer, with haptics authored to land on the beat.",
                        style = MaterialTheme.typography.bodySmall,
                    )
                    Button(
                        onClick = {
                            // The bundled clip is a plain `.mp3` (iOS app bundle /
                            // Android res/raw), so the audio plays while Pulsar
                            // generates the haptics alongside it. Ship an explicit
                            // `.ogg` with baked haptic channels for coupled sync.
                            pulsar?.getPatternComposer()?.apply {
                                parsePatternWithSound(
                                    audioSyncPattern(),
                                    SoundData(uri = "sample_3s.mp3", volume = 1f),
                                )
                                play()
                            }
                            status = "Playing sample_3s.mp3 with synced haptics."
                        },
                        enabled = pulsar != null,
                    ) {
                        Text("Play with haptics")
                    }
                    Button(
                        onClick = {
                            pulsar?.getPatternComposer()?.stop()
                            status = "Stopped audio-synced haptics."
                        },
                        enabled = pulsar != null,
                    ) {
                        Text("Stop")
                    }
                }
            }
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    Text("Lottie + Haptics", style = MaterialTheme.typography.titleMedium)
                    Text(
                        "A checkmark animation with haptics locked to its timeline — " +
                            "the animation drives the haptics (realtime mode).",
                        style = MaterialTheme.typography.bodySmall,
                    )
                    val composition by rememberLottieComposition {
                        LottieCompositionSpec.JsonString(VERIFIED_LOTTIE_JSON)
                    }
                    val progress by animateLottieCompositionAsState(
                        composition,
                        isPlaying = true,
                    )
                    Box(
                        modifier = Modifier.fillMaxWidth(),
                        contentAlignment = Alignment.Center,
                    ) {
                        Image(
                            painter = rememberLottiePainter(composition, progress = { progress }),
                            contentDescription = "Verified",
                            modifier = Modifier.size(160.dp),
                        )
                    }
                    if (pulsar != null) {
                        HapticLottie(
                            progress = progress,
                            durationMillis = composition?.duration?.inWholeMilliseconds ?: 0L,
                            isPlaying = true,
                            haptics = remember { verifiedLottiePattern() },
                            pulsar = pulsar,
                        )
                    }
                }
            }
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    Text("Realtime Composer", style = MaterialTheme.typography.titleMedium)
                    Text("Amplitude ${amplitude.asLabel()}")
                    Slider(
                        value = amplitude,
                        onValueChange = {
                            amplitude = it
                            pulsar?.getRealtimeComposer()?.set(amplitude = amplitude, frequency = frequency)
                            status = "Updated realtime haptics."
                        },
                        enabled = pulsar != null,
                    )
                    Text("Frequency ${frequency.asLabel()}")
                    Slider(
                        value = frequency,
                        onValueChange = {
                            frequency = it
                            pulsar?.getRealtimeComposer()?.set(amplitude = amplitude, frequency = frequency)
                            status = "Updated realtime haptics."
                        },
                        enabled = pulsar != null,
                    )
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        Button(
                            onClick = {
                                pulsar?.getRealtimeComposer()?.playDiscrete(amplitude, frequency)
                                status = "Played a discrete realtime pulse."
                            },
                            enabled = pulsar != null,
                        ) { Text("Pulse once") }
                        Button(
                            onClick = {
                                pulsar?.getRealtimeComposer()?.stop()
                                pulsar?.stopHaptics()
                                status = "Stopped realtime playback."
                            },
                            enabled = pulsar != null,
                        ) { Text("Stop") }
                    }
                }
            }
            Text(status, style = MaterialTheme.typography.bodyMedium)
        }
    }
}

// Pattern authored to sync with `sample_3s.mp3` (music onset analysis): the
// discrete beats land on the track's onsets, the continuous envelope traces its
// energy.
/**
 * Plays presets from a bundle shipped as a Compose resource. KMP has no shared asset API, so the
 * app supplies the bytes — hence the suspending read.
 *
 * KMP v1 has no bundle audio yet, so `arcadeBonusAlert` is felt but not heard.
 */
@Composable
private fun BundleCard(pulsar: Pulsar?, onStatus: (String) -> Unit) {
    var bundle by remember { mutableStateOf<HapticsBundle.Presets?>(null) }
    var error by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(pulsar) {
        if (pulsar == null) return@LaunchedEffect
        runCatching {
            val bytes = Res.readBytes("files/hapticsBundle.pulsar")
            pulsar.loadBundle(HapticsBundle.descriptor, bytes, strict = true)
        }.onSuccess { bundle = it }.onFailure { error = it.message ?: "failed to load bundle" }
    }

    Card(modifier = Modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text("Bundle", style = MaterialTheme.typography.titleMedium)
            val loaded = bundle
            if (loaded == null) {
                Text(error ?: "Loading ${HapticsBundle.bundleId}…", style = MaterialTheme.typography.bodySmall)
            } else {
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    Button(onClick = {
                        loaded.agentpattern.play()
                        onStatus("Played agentpattern from ${HapticsBundle.bundleId}")
                    }) { Text("Agent") }
                    Button(onClick = {
                        loaded.fanfare.play()
                        onStatus("Played fanfare from ${HapticsBundle.bundleId}")
                    }) { Text("Fanfare") }
                    Button(onClick = {
                        loaded.lottie.play()
                        onStatus("Played lottie from ${HapticsBundle.bundleId}")
                    }) { Text("Lottie") }
                }
                val animation = loaded.lottie.animation
                Text(
                    if (animation != null) {
                        "The lottie preset also carries ${animation.data.size} bytes of animation " +
                            "at ${animation.frameRate} fps for your own Lottie view."
                    } else {
                        "No animation bytes carried."
                    },
                    style = MaterialTheme.typography.bodySmall,
                )
            }
        }
    }
}

private fun audioSyncPattern(): PatternData {
    return PatternData(
        continuousPattern = ContinuousPattern(
            amplitude = listOf(
                ValuePoint(time = 0, value = 1.0f),
                ValuePoint(time = 209, value = 0.927f),
                ValuePoint(time = 348, value = 0.843f),
                ValuePoint(time = 580, value = 0.789f),
                ValuePoint(time = 720, value = 0.791f),
                ValuePoint(time = 859, value = 0.693f),
                ValuePoint(time = 1022, value = 0.718f),
                ValuePoint(time = 1161, value = 0.665f),
                ValuePoint(time = 1324, value = 0.565f),
                ValuePoint(time = 1463, value = 0.432f),
                ValuePoint(time = 1649, value = 0.201f),
                ValuePoint(time = 1788, value = 0.068f),
                ValuePoint(time = 3181, value = 0.014f),
            ),
            frequency = listOf(
                ValuePoint(time = 0, value = 0.402f),
                ValuePoint(time = 232, value = 0.061f),
                ValuePoint(time = 604, value = 0.077f),
                ValuePoint(time = 836, value = 0.23f),
                ValuePoint(time = 1068, value = 0.293f),
                ValuePoint(time = 1324, value = 0.346f),
                ValuePoint(time = 1625, value = 0.437f),
                ValuePoint(time = 1904, value = 0.513f),
                ValuePoint(time = 2206, value = 0.63f),
                ValuePoint(time = 2438, value = 0.822f),
                ValuePoint(time = 2670, value = 0.975f),
                ValuePoint(time = 2902, value = 0.947f),
                ValuePoint(time = 3181, value = 0.861f),
            ),
        ),
        discretePattern = listOf(
            ConfigPoint(time = 70, amplitude = 0.299f, frequency = 0.159f),
            ConfigPoint(time = 232, amplitude = 0.401f, frequency = 0.416f),
            ConfigPoint(time = 441, amplitude = 0.627f, frequency = 0.663f),
            ConfigPoint(time = 627, amplitude = 0.31f, frequency = 0.607f),
            ConfigPoint(time = 836, amplitude = 0.792f, frequency = 0.634f),
            ConfigPoint(time = 1022, amplitude = 0.394f, frequency = 0.379f),
            ConfigPoint(time = 1231, amplitude = 0.806f, frequency = 0.679f),
            ConfigPoint(time = 1440, amplitude = 0.612f, frequency = 0.525f),
            ConfigPoint(time = 1649, amplitude = 0.232f, frequency = 0.767f),
            ConfigPoint(time = 2020, amplitude = 0.239f, frequency = 0.625f),
            ConfigPoint(time = 2438, amplitude = 0.385f, frequency = 0.743f),
            ConfigPoint(time = 2624, amplitude = 0.226f, frequency = 0.468f),
            ConfigPoint(time = 2833, amplitude = 0.446f, frequency = 0.733f),
        ),
    )
}

private fun demoPattern(): PatternData {
    return PatternData(
        continuousPattern = ContinuousPattern(
            amplitude = listOf(
                ValuePoint(time = 0, value = 0f),
                ValuePoint(time = 120, value = 1f),
                ValuePoint(time = 280, value = 0.1f),
            ),
            frequency = listOf(
                ValuePoint(time = 0, value = 0.25f),
                ValuePoint(time = 280, value = 0.9f),
            ),
        ),
        discretePattern = listOf(
            ConfigPoint(time = 0, amplitude = 1f, frequency = 0.4f),
            ConfigPoint(time = 140, amplitude = 0.8f, frequency = 0.8f),
        ),
    )
}

private fun Float.asLabel(): String {
    val normalized = (this * 100).toInt() / 100f
    return normalized.toString()
}
