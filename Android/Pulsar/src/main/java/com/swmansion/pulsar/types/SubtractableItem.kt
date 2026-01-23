package com.swmansion.pulsar.types

/**
 * Contains values needed to adjust control point in order to archive specific vibration duration.
 *
 * @param index index of control point.
 * @param maxValue maximum value that can be subtracted.
 * @param value actual value that should be subtracted.
 */
data class SubtractableItem(val index: Int, val maxValue: Long, var value: Long)
