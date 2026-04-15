package com.swmansion.pulsar.kmp.app

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeContentPadding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.tooling.preview.Preview
import com.swmansion.pulsar.kmp.Pulsar

@Composable
@Preview
fun App() {
    MaterialTheme {
        var integrationMessage by remember {
            mutableStateOf("Tap the button to read platform details from the Pulsar library.")
        }
        Column(
            modifier = Modifier
                .background(MaterialTheme.colorScheme.primaryContainer)
                .safeContentPadding()
                .fillMaxSize()
                .padding(24.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Button(
                onClick = {
                    integrationMessage =
                        "${Pulsar.runSwiftSmokeTest()}\nPlatform: ${Pulsar.platform}\nSystem version: ${Pulsar.systemVersion}"
                }
            ) {
                Text("Run Swift interop smoke test")
            }
            Text(
                text = integrationMessage,
                modifier = Modifier.padding(top = 16.dp),
                textAlign = TextAlign.Center,
            )
        }
    }
}
