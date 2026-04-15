package com.swmansion.pulsar.kmp

interface SwiftMessageProvider {
    fun makeMessage(): String
}

object Pulsar {
    private var swiftMessageProvider: SwiftMessageProvider? = null

    val platform: String
        get() = platformName

    val systemVersion: String
        get() = currentSystemVersion

    fun registerSwiftMessageProvider(provider: SwiftMessageProvider) {
        swiftMessageProvider = provider
    }

    fun runSwiftSmokeTest(): String {
        val swiftMessage = swiftMessageProvider?.makeMessage()
            ?: return "Swift callback is not registered."

        return "Pulsar called Swift successfully: $swiftMessage"
    }
}

internal expect val platformName: String
internal expect val currentSystemVersion: String
