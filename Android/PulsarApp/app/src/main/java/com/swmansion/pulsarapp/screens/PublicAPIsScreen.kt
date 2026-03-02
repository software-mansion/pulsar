package com.swmansion.pulsarapp.screens

import android.os.Build
import androidx.annotation.RequiresApi
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.composers.PatternComposer
import com.swmansion.pulsar.types.CompatibilityMode
import com.swmansion.pulsar.types.ConfigPoint
import com.swmansion.pulsar.types.ContinuousPattern
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.ValuePoint

@RequiresApi(Build.VERSION_CODES.R)
@Composable
fun PublicAPIsScreen(pulsar: Pulsar?) {
    var hapticsEnabled by remember { mutableStateOf(true) }
    var soundEnabled by remember { mutableStateOf(true) }
    var cacheEnabled by remember { mutableStateOf(true) }
    var hapticSupport by remember { mutableStateOf(pulsar?.hapticSupport()?.toString() ?: "N/A") }
    var composer by remember { mutableStateOf<PatternComposer?>(null) }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .fillMaxHeight()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Text(
            "Public APIs Testing",
            fontSize = 24.sp,
            modifier = Modifier.padding(bottom = 16.dp)
        )

        LazyColumn(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            contentPadding = PaddingValues(horizontal = 0.dp, vertical = 8.dp)
        ) {
            item {
                APITestRow(
                    label = "Play Preset",
                    state = "Ready",
                    onButtonClick = {
                        pulsar?.getPresets()?.earthquake()
                    }
                )
            }

            item {
                APITestRow(
                    label = "Pulsar_enableHaptics",
                    state = "Haptics: ${if (hapticsEnabled) "ON" else "OFF"}",
                    onButtonClick = {
                        hapticsEnabled = !hapticsEnabled
                        pulsar?.enableHaptics(hapticsEnabled)
                    }
                )
            }

            item {
                APITestRow(
                    label = "Pulsar_enableSound",
                    state = "Sound: ${if (soundEnabled) "ON" else "OFF"}",
                    onButtonClick = {
                        soundEnabled = !soundEnabled
                        pulsar?.enableSound(soundEnabled)
                    }
                )
            }

            item {
                APITestRow(
                    label = "Pulsar_enableCache",
                    state = "Cache: ${if (cacheEnabled) "ON" else "OFF"}",
                    onButtonClick = {
                        cacheEnabled = !cacheEnabled
                        pulsar?.enableCache(cacheEnabled)
                    }
                )
            }

            item {
                APITestRow(
                    label = "Pulsar_clearCache()",
                    state = "Ready",
                    onButtonClick = {
                        pulsar?.clearCache()
                    }
                )
            }

            item {
                APITestRow(
                    label = "Pulsar_preloadPresets",
                    state = "Ready",
                    onButtonClick = {
                        pulsar?.preloadPresets(
                            listOf(
                                "success",
                                "failure",
                                "selection",
                                "impact"
                            )
                        )
                    }
                )
            }

            item {
                APITestRow(
                    label = "Pulsar_stopHaptics()",
                    state = "Ready",
                    onButtonClick = {
                        pulsar?.stopHaptics()
                    }
                )
            }

            item {
                APITestRow(
                    label = "Pulsar_hapticSupport()",
                    state = hapticSupport,
                    onButtonClick = {
                        hapticSupport = pulsar?.hapticSupport()?.toString() ?: "N/A"
                    }
                )
            }

            item {
                APITestRow(
                    label = "Pulsar_forceHapticsSupportLevel",
                    state = "Ready",
                    onButtonClick = {
                        pulsar?.forceHapticsSupportLevel(CompatibilityMode.ADVANCED_SUPPORT)
                    }
                )
            }

            item {
                APITestRow(
                    label = "PatternComposer.parsePattern()",
                    state = "Ready",
                    onButtonClick = {
                        if (composer == null) {
                            composer = pulsar?.getPatternComposer()
                        }
                        val pattern = PatternData(
                            continuousPattern = ContinuousPattern(
                                amplitude = listOf(
                                    ValuePoint(time = 0L, value = 0f),
                                    ValuePoint(time = 100L, value = 1f),
                                    ValuePoint(time = 200L, value = 0f),
                                ),
                                frequency = listOf(
                                    ValuePoint(time = 0L, value = 0.4f),
                                    ValuePoint(time = 100L, value = 1f),
                                    ValuePoint(time = 200L, value = 0.4f),
                                ),
                            ),
                            discretePattern = listOf(
                                ConfigPoint(time = 50L, amplitude = 1f, frequency = 1f),
                                ConfigPoint(time = 150L, amplitude = 1f, frequency = 1f),
                            ),
                        )
                        composer?.parsePattern(pattern)
                    }
                )
            }

            item {
                APITestRow(
                    label = "PatternComposer.play()",
                    state = "Ready",
                    onButtonClick = {
                        composer?.play()
                    }
                )
            }

            item {
                APITestRow(
                    label = "PatternComposer.stop()",
                    state = "Ready",
                    onButtonClick = {
                        composer?.stop()
                    }
                )
            }
        }
    }
}

@Composable
private fun APITestRow(
    label: String,
    state: String,
    onButtonClick: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                label,
                modifier = Modifier
                    .weight(1f)
                    .padding(start = 8.dp),
                fontSize = 14.sp
            )
            Button(
                onClick = onButtonClick,
                modifier = Modifier.padding(end = 8.dp)
            ) {
                Text("Test")
            }
        }
        Text(
            state,
            modifier = Modifier
                .padding(start = 8.dp, top = 4.dp),
            fontSize = 12.sp
        )
    }
}
