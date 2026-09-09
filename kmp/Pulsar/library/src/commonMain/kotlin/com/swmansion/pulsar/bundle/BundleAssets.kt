package com.swmansion.pulsar.kmp.bundle

internal expect fun readBundleFile(path: String): ByteArray

internal expect fun readBundleAsset(assetName: String): ByteArray
