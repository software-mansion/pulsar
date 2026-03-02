package com.swmansion.pulsarapp.screens

import android.os.Build
import androidx.annotation.RequiresApi
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
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

@RequiresApi(Build.VERSION_CODES.O)
@Composable
fun RealtimeComposerScreen() {
    val context = LocalContext.current
    val engine = remember { HapticEngineWrapper(context) }
    val realtimeComposer = remember { RealtimeComposer(engine) }
    
    var amplitude by remember { mutableStateOf(0.5f) }
    var frequency by remember { mutableStateOf(0.5f) }
    var isActive by remember { mutableStateOf(false) }
    
    DisposableEffect(Unit) {
        onDispose {
            realtimeComposer.stop()
        }
    }
    
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
                                // Map x position to frequency (0 to 1)
                                frequency = (offset.x / size.width).coerceIn(0f, 1f)
                                // Map y position to amplitude (inverted: top = 1, bottom = 0)
                                amplitude = (1f - (offset.y / size.height)).coerceIn(0f, 1f)
                                
                                realtimeComposer.set(amplitude, frequency)
                            },
                            onDrag = { change, _ ->
                                change.consume()
                                // Update frequency based on x position
                                frequency = (change.position.x / size.width).coerceIn(0f, 1f)
                                // Update amplitude based on y position (inverted)
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
