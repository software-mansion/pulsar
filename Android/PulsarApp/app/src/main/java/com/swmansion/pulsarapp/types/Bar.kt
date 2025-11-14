package com.swmansion.pulsarapp.types

/**
 * Represents single vibration bar.
 *
 * @param x1 Bar start.
 * @param x2 Bar end.
 * @param amplitude Bar amplitude. Value range 1-255.
 */
data class Bar(val x1: Long, val x2: Long, val amplitude: Int)