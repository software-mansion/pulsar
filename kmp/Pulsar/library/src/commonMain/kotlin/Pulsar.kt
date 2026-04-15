package com.swmansion.pulsar.kmp

object Pulsar {
    val platform: String
        get() = platformName
}

internal expect val platformName: String
