package com.swmansion.pulsar.kmp.bundle

import com.swmansion.pulsar.kmp.PulsarInitializerState
import java.io.File

internal actual fun readBundleFile(path: String): ByteArray = File(path).readBytes()

internal actual fun readBundleAsset(assetName: String): ByteArray {
    val context = PulsarInitializerState.applicationContext
        ?: throw PulsarBundleException(
            "Pulsar has no application context yet — load the bundle after app startup, " +
                "or pass the bytes yourself.",
        )
    return context.assets.open(assetName).use { it.readBytes() }
}

internal actual fun writeBundleMedia(bundleId: String, name: String, bytes: ByteArray): String {
    val context = PulsarInitializerState.applicationContext
        ?: throw PulsarBundleException(
            "Pulsar has no application context yet — load the bundle after app startup.",
        )
    val dir = File(context.cacheDir, "PulsarBundles/$bundleId").apply { mkdirs() }
    return File(dir, name).apply { writeBytes(bytes) }.absolutePath
}
