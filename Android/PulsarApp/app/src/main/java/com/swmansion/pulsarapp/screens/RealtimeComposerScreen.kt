package com.swmansion.pulsarapp.screens

import android.os.Build
import androidx.annotation.RequiresApi
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.swmansion.pulsar.composers.RealtimeComposer
import com.swmansion.pulsar.haptics.HapticEngineWrapper
import com.swmansion.pulsar.types.CompatibilityMode
import com.swmansion.pulsar.types.RealtimeComposerStrategy

@RequiresApi(Build.VERSION_CODES.O)
@Composable
fun RealtimeComposerScreen() {
    val context = LocalContext.current
    val engine = remember { HapticEngineWrapper(context) }
    var selectedStrategy by remember { mutableStateOf(RealtimeComposerStrategy.ENVELOPE_WITH_DISCRETE_PRIMITIVES) }
    val realtimeComposer = remember(selectedStrategy) {
        RealtimeComposer(engine, selectedStrategy, engine.getRealCompatibilityMode())
    }

    var amplitude by remember { mutableStateOf(0.5f) }
    var frequency by remember { mutableStateOf(0.5f) }
    var isActive by remember { mutableStateOf(false) }

    DisposableEffect(Unit) {
        onDispose {
            realtimeComposer.stop()
        }
    }

    val strategies = listOf(
        RealtimeComposerStrategy.ENVELOPE_WITH_DISCRETE_PRIMITIVES to "Envelope+Discrete",
        RealtimeComposerStrategy.ENVELOPE to "Envelope",
        RealtimeComposerStrategy.PRIMITIVE_COMPLEX to "Primitive Complex",
        RealtimeComposerStrategy.PRIMITIVE_TICK to "Primitive Tick",
    )

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .fillMaxHeight()
            .background(Color.White),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                "Realtime Haptics Composer",
                fontSize = 20.sp,
                color = Color.Black
            )

            Spacer(modifier = Modifier.height(16.dp))

            Text("Strategy", fontSize = 13.sp, color = Color.Gray)
            Spacer(modifier = Modifier.height(6.dp))
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.padding(horizontal = 16.dp)
            ) {
                strategies.forEach { (strategy, label) ->
                    val isSelected = selectedStrategy == strategy
                    Box(
                        modifier = Modifier
                            .clickable {
                                realtimeComposer.stop()
                                isActive = false
                                selectedStrategy = strategy
                            }
                            .background(
                                if (isSelected) Color(0xFF1565C0) else Color(0xFFE0E0E0),
                                RoundedCornerShape(8.dp)
                            )
                            .padding(horizontal = 10.dp, vertical = 6.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            label,
                            fontSize = 11.sp,
                            color = if (isSelected) Color.White else Color.DarkGray
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                "Amplitude: ${String.format("%.2f", amplitude)}",
                fontSize = 16.sp,
                color = Color.Gray
            )
            Text(
                "Frequency: ${String.format("%.2f", frequency)}",
                fontSize = 16.sp,
                color = Color.Gray
            )
            Text(
                "Status: ${if (isActive) "Active" else "Inactive"}",
                fontSize = 16.sp,
                color = if (isActive) Color.Green else Color.Red
            )

            Spacer(modifier = Modifier.height(32.dp))

            Box(
                modifier = Modifier
                    .size(300.dp)
                    .border(2.dp, Color.Black)
                    .background(if (isActive) Color(0xFFE3F2FD) else Color.LightGray)
                    .pointerInput(Unit) {
                        detectDragGestures(
                            onDragStart = { offset ->
                                isActive = true
                                frequency = (offset.x / size.width).coerceIn(0f, 1f)
                                amplitude = (1f - (offset.y / size.height)).coerceIn(0f, 1f)
                                realtimeComposer.set(amplitude, frequency)
                            },
                            onDrag = { change, _ ->
                                change.consume()
                                frequency = (change.position.x / size.width).coerceIn(0f, 1f)
                                amplitude = (1f - (change.position.y / size.height)).coerceIn(0f, 1f)
                                realtimeComposer.set(amplitude, frequency)
                            },
                            onDragEnd = {
                                isActive = false
                                realtimeComposer.stop()
                            },
                            onDragCancel = {
                                isActive = false
                                realtimeComposer.stop()
                            }
                        )
                    },
                contentAlignment = Alignment.Center
            ) {
                Text(
                    "Drag here",
                    color = Color.DarkGray,
                    fontSize = 18.sp
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                "← Lower Frequency | Higher Frequency →",
                fontSize = 12.sp,
                color = Color.Gray
            )
            Text(
                "↓ Lower Amplitude | Higher Amplitude ↑",
                fontSize = 12.sp,
                color = Color.Gray
            )
        }
    }
}
