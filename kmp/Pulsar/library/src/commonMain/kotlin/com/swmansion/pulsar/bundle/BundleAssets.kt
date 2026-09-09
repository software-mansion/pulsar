package com.swmansion.pulsar.kmp.bundle

internal expect fun readBundleFile(path: String): ByteArray

internal expect fun readBundleAsset(assetName: String): ByteArray

/**
 * Writes a bundle's media entry to a platform cache directory and returns its absolute path.
 * Both composers take audio by uri, so the bytes inside the `.pulsar` have to reach disk first.
 */
internal expect fun writeBundleMedia(bundleId: String, name: String, bytes: ByteArray): String
