package com.swmansion.pulsar.kmp.androidimpl.types

/**
 * @param ADVANCED_SUPPORT - Supports for advance envelope API, full control over frequency, amplitude and timing, required Android API 36
 * @param STANDARD_SUPPORT - Supports for control over amplitude and timing.
 * @param LIMITED_SUPPORT - Supports for control over timing, required Android API 26
 * @param NO_SUPPORT - No supports for haptics
 */
enum class CompatibilityMode {
    NO_SUPPORT,
    LIMITED_SUPPORT,
    STANDARD_SUPPORT,
    ADVANCED_SUPPORT,
}
