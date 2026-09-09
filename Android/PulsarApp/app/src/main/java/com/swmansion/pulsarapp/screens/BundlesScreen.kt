package com.swmansion.pulsarapp.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.bundle.PresetHandle
import com.swmansion.pulsar.lottie.HapticLottieController
import com.swmansion.pulsar.lottie.HapticLottieView
import com.swmansion.pulsarapp.bundles.HapticsBundle

/**
 * Plays presets from `app/src/pulsarBundles/hapticsBundle.pulsar` — the only checked-in artefact.
 * The `com.swmansion.pulsar.gen` plugin packages it into the APK and generates [HapticsBundle].
 */
@Composable
fun BundlesScreen(pulsar: Pulsar?) {
    val bundle: HapticsBundle.Presets? = remember(pulsar) {
        runCatching { pulsar?.loadBundleSync(HapticsBundle.descriptor) }.getOrNull()
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .verticalScroll(rememberScrollState())
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text("Preset bundles", fontSize = 24.sp)

        if (bundle == null) {
            Text("Bundle failed to load.", fontSize = 14.sp)
            return@Column
        }

        Text(
            "Presets come from ${HapticsBundle.bundleId}, packaged into the APK assets by the " +
                "pulsar-gen Gradle plugin.",
            fontSize = 14.sp,
        )

        PresetButton("Agent pattern", bundle.agentpattern)
        PresetButton("Fanfare", bundle.fanfare)
        // Authored with a synced sound; the native SDK plays it alongside the haptics.
        PresetButton("Arcade bonus alert (with audio)", bundle.arcadeBonusAlert)
        // Carries Lottie bytes: Pulsar times them, the app renders them.
        PresetButton("Lottie", bundle.lottie)

        Text("Animation from a preset", fontSize = 18.sp)
        Text(
            "The Lottie preset carries its animation as well as its pattern, so HapticLottieView " +
                "needs neither an animation nor a haptics argument.",
            fontSize = 14.sp,
        )

        val controllerRef = remember { arrayOfNulls<HapticLottieController>(1) }
        AndroidView(
            modifier = Modifier
                .fillMaxWidth()
                .height(200.dp),
            factory = { ctx ->
                HapticLottieView(ctx).apply {
                    repeatCount = 0
                    if (pulsar != null) {
                        controllerRef[0] = bindHaptics(pulsar, preset = bundle.lottie)
                            .also { it.play() }
                    }
                }
            },
        )
        OutlinedButton(
            onClick = { controllerRef[0]?.play() },
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text("▶ Replay animation")
        }

        Text(
            "Ids are also reachable at runtime: ${HapticsBundle.descriptor.presetIds.joinToString()}",
            fontSize = 12.sp,
        )
    }
}

@Composable
private fun PresetButton(label: String, preset: PresetHandle) {
    Button(onClick = { preset.play() }, modifier = Modifier.fillMaxWidth()) {
        Text("$label  ·  ${preset.duration} ms")
    }
}
