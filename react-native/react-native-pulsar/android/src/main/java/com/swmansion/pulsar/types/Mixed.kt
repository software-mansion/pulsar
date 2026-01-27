package com.swmansion.pulsar.types

/**
 * @param ADVANCED_SUPPORT - Supports for advance envelope API, full control over frequency, amplitude and timing, required Android API 36
 * @param STANDARD_SUPPORT - Supports for basic envelope API, full control over frequency, amplitude and timing, required Android API 36
 * @param LIMITED_SUPPORT - Supports for amplitude waveform API, control over amplitude and timing, required Android API 26
 * @param MINIMAL_SUPPORT - Supports for waveform API, full control only over timing, required Android API 26
 * @param NO_SUPPORT - No supports for haptics
 */
enum class CompatibilityMode {
    NO_SUPPORT,
    MINIMAL_SUPPORT,
    LIMITED_SUPPORT,
    STANDARD_SUPPORT,
    ADVANCED_SUPPORT,
}
