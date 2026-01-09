package com.swmansion.pulsarapp.types

fun verifyRelativeTime(relativeTime: Long) {
  if (relativeTime < 0) {
    throw Exception("Relative time cannot be negative.")
  }
}

fun verifyIntensity(intensity: Float) {
  if (!(0 <= intensity && intensity <= 1)) {
    throw Exception("Intensity must be from interval [0,1].")
  }
}

fun verifySharpness(sharpness: Float) {
  if (!(0 < sharpness && sharpness <= 1)) {
    throw Exception("Sharpness must be from interval (0,1].")
  }
}
