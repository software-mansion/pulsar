package com.swmansion.pulsar.kmp

enum class PulsarPlatform {
    ANDROID,
    IOS,
}

internal expect fun currentPulsarPlatform(): PulsarPlatform
