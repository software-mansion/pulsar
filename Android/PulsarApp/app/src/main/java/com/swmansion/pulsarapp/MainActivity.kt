package com.swmansion.pulsarapp

import android.annotation.SuppressLint
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.material3.Text
import com.swmansion.pulsarapp.ui.theme.PulsarAppTheme

import androidx.annotation.RequiresApi
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import com.swmansion.pulsarapp.types.BarPreset

class MainActivity : ComponentActivity() {
    private var hapticsHandler: HapticsHandler? = null

    @SuppressLint("NewApi")
    @RequiresApi(Build.VERSION_CODES.O)
    override fun onCreate(savedInstanceState: Bundle?) {
        hapticsHandler = HapticsHandler(this)

        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            PulsarAppTheme {
                Column(
                    modifier = Modifier.fillMaxWidth().fillMaxHeight(),
                    verticalArrangement = Arrangement.Center,
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    VibrationButton(SUCCESS_PRESET)
                }
            }
        }
    }

    @RequiresApi(Build.VERSION_CODES.O)
    @Composable
    fun VibrationButton(preset: BarPreset){
        Button(
            onClick = { hapticsHandler?.playPresetVibration(preset) }
        ) {
            Text(preset.name)
        }
    }
}

