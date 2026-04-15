package com.swmansion.pulsar.kmp

internal actual val platformName: String = "JVM"

internal actual val currentSystemVersion: String =
    System.getProperty("java.version") ?: "Unknown JVM version"
