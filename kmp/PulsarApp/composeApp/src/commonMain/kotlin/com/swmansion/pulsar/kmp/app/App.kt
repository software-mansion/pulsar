package com.swmansion.pulsar.kmp.app

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeContentPadding
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
import com.swmansion.pulsar.kmp.Pulsar
import com.swmansion.pulsar.kmp.ValuePoint

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
