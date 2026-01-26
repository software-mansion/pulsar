package com.swmansion.pulsarapp

import android.annotation.SuppressLint
import android.os.Build
import android.os.Bundle
import android.os.Vibrator
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.annotation.RequiresApi
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
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
import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.composers.PatternComposerImpl
import com.swmansion.pulsar.haptics.COMPLEX_PRESET
import com.swmansion.pulsar.haptics.EARTHQUAKE_PRESET
import com.swmansion.pulsar.haptics.ENVELOPE_PRESET
import com.swmansion.pulsar.haptics.FAIL_PRESET
import com.swmansion.pulsar.haptics.FALLING_BRICKS
import com.swmansion.pulsar.haptics.FREQUENCY_PRESET
import com.swmansion.pulsar.haptics.LONG_RISING_PRESET
import com.swmansion.pulsar.haptics.MILK_PRESET
import com.swmansion.pulsar.haptics.RANDOM_PRESET
import com.swmansion.pulsar.haptics.SUCCESS_PRESET
import com.swmansion.pulsar.haptics.TEST_PRESET
import com.swmansion.pulsar.haptics.UP_AND_DOWN_PRESET
import com.swmansion.pulsar.haptics.UP_PRESET
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsarapp.screens.EmptyScreen
import com.swmansion.pulsarapp.ui.theme.PulsarAppTheme

class MainActivity : ComponentActivity() {

  private var pulsar: Pulsar? = null
  private var composer: PatternComposerImpl? = null

  private val vibrator by lazy { getSystemService(Vibrator::class.java) }

  @SuppressLint("NewApi")
  @RequiresApi(Build.VERSION_CODES.O)
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

  @RequiresApi(Build.VERSION_CODES.O)
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


                pulsar?.Presets()?.Earthquake()

//              if (composer == null) {
//                composer = pulsar?.PatternComposer()
//              }
//              composer?.parsePattern(PatternData(
//                ContinuesPattern(
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
              pulsar?.Presets()?.Success()
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

          Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text("Docs presets:")
            Row {
              VibrationButton(FALLING_BRICKS)
              VibrationButton(EARTHQUAKE_PRESET)
              VibrationButton(RANDOM_PRESET)
            }
            Row {
              VibrationButton(MILK_PRESET)
              VibrationButton(FAIL_PRESET)
              VibrationButton(SUCCESS_PRESET)
            }
          }

          Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text("Bars presets:")
            Row {
              VibrationButton(SUCCESS_PRESET)
              VibrationButton(FAIL_PRESET)
              VibrationButton(FALLING_BRICKS)
            }
          }

          Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text("Plot presets:")
            Row {
              VibrationButton(EARTHQUAKE_PRESET)
              VibrationButton(RANDOM_PRESET)
            }
            Row {
              VibrationButton(ENVELOPE_PRESET)
              VibrationButton(LONG_RISING_PRESET)
              VibrationButton(UP_PRESET)
            }
            Row {
              VibrationButton(UP_AND_DOWN_PRESET)
              VibrationButton(FREQUENCY_PRESET)
            }
          }

          Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text("Complex presets:")
            Row {
              VibrationButton(COMPLEX_PRESET)
              VibrationButton(TEST_PRESET)
            }
          }
        }
    }

  @RequiresApi(Build.VERSION_CODES.O)
  @Composable
  private fun VibrationButton(preset: Preset) {
    Button(
      modifier = Modifier.padding(6.dp),
      onClick = { /*pulsar?.engine?.playPresetVibration(preset)*/ },
    ) {
      Text(preset.name)
    }
  }

  @Composable
  private fun DeviceInfo() {
    Column {
      Text("Device supports amplitude: ${pulsar?.engine?.isAmplitudeSupported()}")
      Text("Device supports envelope: ${pulsar?.engine?.isEnvelopeSupported()}")
      Text("Device supports frequency profile: ${pulsar?.engine?.isFrequencyProfileSupported()}")
    }
  }
}

enum class BottomTab {
  Home,
  Settings
}
