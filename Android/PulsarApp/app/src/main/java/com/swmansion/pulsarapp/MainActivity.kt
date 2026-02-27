package com.swmansion.pulsarapp

import android.annotation.SuppressLint
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.view.HapticFeedbackConstants
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.annotation.RequiresApi
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.core.view.ViewCompat.performHapticFeedback
import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.composers.PatternComposer
import com.swmansion.pulsarapp.screens.EmptyScreen
import com.swmansion.pulsarapp.ui.theme.PulsarAppTheme

class MainActivity : ComponentActivity() {

  private var pulsar: Pulsar? = null
  private var composer: PatternComposer? = null

  private val vibrator by lazy { getSystemService(Vibrator::class.java) }

  @SuppressLint("NewApi")
  override fun onCreate(savedInstanceState: Bundle?) {
    pulsar = Pulsar(this)

    super.onCreate(savedInstanceState)
    enableEdgeToEdge()
    setContent {
      PulsarAppTheme {
        var selectedTab by remember { mutableStateOf<BottomTab>(BottomTab.Home) }

        Column(
          modifier = Modifier.fillMaxWidth().fillMaxHeight(),
        ) {
          Column(
            modifier = Modifier
              .fillMaxWidth()
              .weight(1f),
            verticalArrangement = Arrangement.spacedBy(32.dp, Alignment.CenterVertically),
            horizontalAlignment = Alignment.CenterHorizontally,
          ) {
            when (selectedTab) {
              BottomTab.Home -> HomeContent()
              BottomTab.Settings -> EmptyScreen()
            }
          }

          NavigationBar {
            NavigationBarItem(
              icon = { Icon(Icons.Filled.Home, contentDescription = "Home") },
              label = { Text("Home") },
              selected = selectedTab == BottomTab.Home,
              onClick = { selectedTab = BottomTab.Home }
            )
            NavigationBarItem(
              icon = { Icon(Icons.Filled.Settings, contentDescription = "Settings") },
              label = { Text("Settings") },
              selected = selectedTab == BottomTab.Settings,
              onClick = { selectedTab = BottomTab.Settings }
            )
          }
        }
      }
    }
  }

  @RequiresApi(Build.VERSION_CODES.R)
  @Composable
  private fun HomeContent() {
    Column(
          modifier = Modifier.fillMaxWidth().fillMaxHeight(),
          verticalArrangement = Arrangement.spacedBy(32.dp, Alignment.CenterVertically),
          horizontalAlignment = Alignment.CenterHorizontally,
        ) {
          DeviceInfo()

        
          Button(
            modifier = Modifier.padding(6.dp),
            onClick = {
              vibrator.vibrate(VibrationEffect.createPredefined(VibrationEffect.EFFECT_CLICK))
//              pulsar?.test()


//              pulsar.Presets().Earthquake()

//              val timings: LongArray = longArrayOf(
//                50, 50, 50, 50, 50, 100, 350, 25, 25, 25, 25, 200)
//              val amplitudes: IntArray = intArrayOf(
//                33, 51, 75, 113, 170, 255, 0, 38, 62, 100, 160, 255)
//              val repeatIndex = -1 // Don't repeat.
//
//              vibrator.vibrate(
//                VibrationEffect.createWaveform(
//                timings, amplitudes, repeatIndex))

//              val delayMs = 100
//              vibrator.vibrate(
//                VibrationEffect.startComposition().addPrimitive(
//                  VibrationEffect.Composition.PRIMITIVE_SPIN, 0.8f
//                ).addPrimitive(
//                  VibrationEffect.Composition.PRIMITIVE_SPIN, 0.6f
//                ).addPrimitive(
//                  VibrationEffect.Composition.PRIMITIVE_THUD, 1.0f, delayMs
//                ).compose())

//              vibrator.vibrate(VibrationEffect.BasicEnvelopeBuilder()
//                .setInitialSharpness(0.0f)
//                .addControlPoint(1.0f, 1.0f, 500)
//                .addControlPoint(0.0f, 1.0f, 100)
//                .build()
//              )

//              val profile = vibrator?.frequencyProfile

//              vibrator.vibrate(VibrationEffect.BasicEnvelopeBuilder()
//                .setInitialSharpness(0.0f)
//                .addControlPoint(1.0f, 1.0f, 1000)
//                .addControlPoint(0.0f, 0.0f, 1000)
//                .build()
//              )
//              vibrator.vibrate(VibrationEffect.BasicEnvelopeBuilder()
//                .setInitialSharpness(0.0f)
//                .addControlPoint(1.0f, .5f, 100)
//                .addControlPoint(1.0f, .5f, 3000)
//                .addControlPoint(.0f, .5f, 100)
//                .build()
//              )

//              vibrator.vibrate(
//                VibrationEffect.BasicEnvelopeBuilder()
//                .setInitialSharpness(0.0f)
//                .addControlPoint(1.0f, 1.0f, 1)
//                .addControlPoint(1.0f, 1.0f, 10)
//                .addControlPoint(.0f, .0f, 1)
//                .build()
//              )


//                pulsar?.getPresets()?.Earthquake()

//              if (composer == null) {
//                composer = pulsar?.PatternComposer()
//              }
//              composer?.parsePattern(PatternData(
//                ContinuousPattern(
//                  listOf(
//                    PatternPoint(0f, 0f),
//                    PatternPoint(100f, 1f),
//                    PatternPoint(200f, 0f),
//                  ),
//                  listOf(
//                    PatternPoint(0f, 0f),
//                    PatternPoint(100f, 1f),
//                    PatternPoint(200f, 0f),
//                  )
//                ),
//                listOf(
//                  DiscretePoint(50f, 1f, 1f),
//                  DiscretePoint(150f, 1f, 1f),
//                )
//              ))
//              composer?.play()
            },
          ) {
            Text("mleko1")
          }
          Button(
            modifier = Modifier.padding(6.dp),
            onClick = {
              pulsar?.getPresets()?.Success()
//              vibrator.vibrate(VibrationEffect.WaveformEnvelopeBuilder()
//                .setInitialFrequencyHz(50f)
//                .addControlPoint(1.0f, 109f, 100)
//                .addControlPoint(1.0f, 109f, 3000)
//                .addControlPoint(.0f, 109f, 100)
//                .build()
//              )
//              vibrator.vibrate(VibrationEffect.WaveformEnvelopeBuilder()
//                .addControlPoint(1.0f, 60f, 50)
//                .addControlPoint(1.0f, 120f, 100)
//                .addControlPoint(1.0f, 120f, 200)
//                .addControlPoint(0.0f, 60f, 50)
//                .build()
//              )
            },
          ) {
            Text("mleko2")
          }


        }
    }

  @Composable
  private fun DeviceInfo() {
    Column {
      Text("Device compatibility mode: ${pulsar?.hapticSupport()}")
    }
  }
}

enum class BottomTab {
  Home,
  Settings
}
