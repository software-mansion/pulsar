package com.swmansion.pulsarapp

import android.annotation.SuppressLint
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.annotation.RequiresApi
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.WindowInsetsSides
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.only
import androidx.compose.foundation.layout.systemBars
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Build
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsarapp.screens.PresetsScreen
import com.swmansion.pulsarapp.screens.PublicAPIsScreen
import com.swmansion.pulsarapp.screens.RealtimeComposerScreen
import com.swmansion.pulsarapp.ui.theme.PulsarAppTheme

class MainActivity : ComponentActivity() {

  private var pulsar: Pulsar? = null

  @SuppressLint("NewApi")
  @RequiresApi(Build.VERSION_CODES.R)
  override fun onCreate(savedInstanceState: Bundle?) {
    pulsar = Pulsar(this)

    super.onCreate(savedInstanceState)
    enableEdgeToEdge()
    setContent {
      PulsarAppTheme {
        var selectedTab by remember { mutableStateOf<BottomTab>(BottomTab.Presets) }

        Column(
          modifier = Modifier
            .fillMaxWidth()
            .fillMaxHeight(),
        ) {
          Column(
            modifier = Modifier
              .fillMaxWidth()
              .weight(1f)
              .windowInsetsPadding(
                WindowInsets.systemBars.only(
                  WindowInsetsSides.Top + WindowInsetsSides.Horizontal
                )
              ),
          ) {
            when (selectedTab) {
              BottomTab.Presets -> PresetsScreen(pulsar)
              BottomTab.Composer -> RealtimeComposerScreen()
              BottomTab.APIs -> PublicAPIsScreen(pulsar)
            }
          }

          NavigationBar {
            NavigationBarItem(
              icon = { Icon(Icons.Filled.Home, contentDescription = "Presets") },
              label = { Text("Presets") },
              selected = selectedTab == BottomTab.Presets,
              onClick = { selectedTab = BottomTab.Presets }
            )
            NavigationBarItem(
              icon = { Icon(Icons.Filled.Edit, contentDescription = "Composer") },
              label = { Text("Composer") },
              selected = selectedTab == BottomTab.Composer,
              onClick = { selectedTab = BottomTab.Composer }
            )
            NavigationBarItem(
              icon = { Icon(Icons.Filled.Build, contentDescription = "APIs") },
              label = { Text("APIs") },
              selected = selectedTab == BottomTab.APIs,
              onClick = { selectedTab = BottomTab.APIs }
            )
          }
        }
      }
    }
  }
}

enum class BottomTab {
  Presets,
  Composer,
  APIs
}
