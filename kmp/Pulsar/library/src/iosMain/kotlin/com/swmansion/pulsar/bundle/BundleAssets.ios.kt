package com.swmansion.pulsar.kmp.bundle

import kotlinx.cinterop.ExperimentalForeignApi
import kotlinx.cinterop.addressOf
import kotlinx.cinterop.usePinned
import platform.Foundation.NSBundle
import platform.Foundation.NSData
import platform.Foundation.dataWithContentsOfFile
import platform.posix.memcpy

internal actual fun readBundleFile(path: String): ByteArray {
    val data = NSData.dataWithContentsOfFile(path)
        ?: throw PulsarBundleException("Could not read bundle at \"$path\"")
    return data.toByteArray()
}

internal actual fun readBundleAsset(assetName: String): ByteArray {
    val extension = assetName.substringAfterLast('.', "pulsar")
    val name = assetName.removeSuffix(".$extension")
    val path = NSBundle.mainBundle.pathForResource(name, extension)
        ?: throw PulsarBundleException("Bundle resource \"$assetName\" not found in the app bundle")
    return readBundleFile(path)
}

@OptIn(ExperimentalForeignApi::class)
private fun NSData.toByteArray(): ByteArray {
    val size = length.toInt()
    if (size == 0) return ByteArray(0)
    return ByteArray(size).also { out ->
        out.usePinned { memcpy(it.addressOf(0), bytes, length) }
    }
}
