package com.swmansion.pulsarapp.types

/**
 * Represents single vibration bar.
 *
 * @param x1 Bar start.
 * @param x2 Bar end.
 * @param intensity Bar intensity. Value range [0-1].
 * @param sharpness Bar sharpness. Value range (0-1]. Ignored for devices that do not support
 *   envelopes.
 */
data class Bar(val x1: Long, val x2: Long, val intensity: Float, val sharpness: Float) {
  val point1 = Point(intensity, sharpness, x1)
  val point2 = Point(intensity, sharpness, x2)
}
