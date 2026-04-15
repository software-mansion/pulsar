package com.swmansion.pulsar.kmp

object Pulsar {
    val platform: String
        get() = platformName

    val systemVersion: String
        get() = currentSystemVersion
}

internal expect val platformName: String
internal expect val currentSystemVersion: String
