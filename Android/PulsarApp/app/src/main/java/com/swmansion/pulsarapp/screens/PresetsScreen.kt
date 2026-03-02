package com.swmansion.pulsarapp.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.swmansion.pulsar.Pulsar

data class PresetItem(
    val name: String,
    val action: () -> Unit
)

@Composable
fun PresetsScreen(pulsar: Pulsar?) {
    val presets = androidx.compose.runtime.remember {
        listOf(
            PresetItem("Success") { pulsar?.getPresets()?.success() },
//            PresetItem("Failure") { pulsar?.getPresets()?.failure() },
//            PresetItem("Selection") { pulsar?.getPresets()?.selection() },
//            PresetItem("Impact") { pulsar?.getPresets()?.impact() },
//            PresetItem("Warning") { pulsar?.getPresets()?.warning() },
//            PresetItem("Notification") { pulsar?.getPresets()?.notification() },
//            PresetItem("Light") { pulsar?.getPresets()?.light() },
//            PresetItem("Medium") { pulsar?.getPresets()?.medium() },
//            PresetItem("Heavy") { pulsar?.getPresets()?.heavy() },
            PresetItem("Earthquake") { pulsar?.getPresets()?.earthquake() },
        )
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .fillMaxHeight()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Text(
            "Haptics Presets",
            fontSize = 24.sp,
            modifier = Modifier.padding(bottom = 16.dp)
        )

        LazyColumn(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f),
            verticalArrangement = Arrangement.spacedBy(8.dp),
            contentPadding = PaddingValues(horizontal = 0.dp, vertical = 8.dp)
        ) {
            items(presets) { preset ->
                PresetItemRow(preset)
            }
        }
    }
}

@Composable
private fun PresetItemRow(preset: PresetItem) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            preset.name,
            modifier = Modifier
                .weight(1f)
                .padding(start = 16.dp),
            fontSize = 16.sp
        )
        Button(
            onClick = preset.action,
            modifier = Modifier.padding(end = 8.dp)
        ) {
            Text("Play")
        }
    }
}

