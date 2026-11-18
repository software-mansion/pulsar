package com.swmansion.pulsar.kmp.bundle

internal expect fun readBundleFile(path: String): ByteArray

internal expect fun readBundleAsset(assetName: String): ByteArray

/**
 * Writes a bundle's media entry to a platform cache directory and returns its absolute path.
 * Composers take audio by uri and video players read files, so the bytes have to reach disk first.
 * [name] may contain a subdirectory.
 */
internal expect fun writeBundleMedia(bundleId: String, name: String, bytes: ByteArray): String
