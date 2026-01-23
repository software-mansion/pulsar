package com.swmansion.pulsarapp

import android.annotation.SuppressLint
import android.os.Build
import android.os.Bundle
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
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
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
import com.swmansion.pulsar.haptics.VibrationHandler
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsarapp.ui.theme.PulsarAppTheme

class MainActivity : ComponentActivity() {
  private var hapticsHandler: VibrationHandler? = null

  @SuppressLint("NewApi")
  @RequiresApi(Build.VERSION_CODES.O)
  override fun onCreate(savedInstanceState: Bundle?) {
    hapticsHandler = VibrationHandler(this)

    super.onCreate(savedInstanceState)
    enableEdgeToEdge()
    setContent {
      PulsarAppTheme {
        Column(
          modifier = Modifier.fillMaxWidth().fillMaxHeight(),
          verticalArrangement = Arrangement.spacedBy(32.dp, Alignment.CenterVertically),
          horizontalAlignment = Alignment.CenterHorizontally,
        ) {
          DeviceInfo()

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
    }
  }

  @RequiresApi(Build.VERSION_CODES.O)
  @Composable
  private fun VibrationButton(preset: Preset) {
    Button(
      modifier = Modifier.padding(6.dp),
      onClick = { hapticsHandler?.playPresetVibration(preset) },
    ) {
      Text(preset.name)
    }
  }

  @Composable
  private fun DeviceInfo() {
    Column {
      Text("Device supports amplitude: ${hapticsHandler?.isAmplitudeSupported()}")
      Text("Device supports envelope: ${hapticsHandler?.isEnvelopeSupported()}")
      Text("Device supports frequency profile: ${hapticsHandler?.isFrequencyProfileSupported()}")
    }
  }
}
