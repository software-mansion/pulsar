package com.swmansion.pulsarapp

import com.swmansion.pulsarapp.types.Bar
import com.swmansion.pulsarapp.types.EnvelopePoint
import com.swmansion.pulsarapp.types.Preset
import kotlin.collections.arrayListOf

val SUCCESS_PRESET =
  Preset(
    name = "Success",
    bars =
      arrayListOf(
        Bar(0, 100, 0.809f, 0.616f),
        Bar(200, 300, 0.809f, 0.619f),
        Bar(550, 650, 1f, 1f)
      ),
  )
val FAIL_PRESET =
  Preset(
    name = "Fail",
    bars =
      arrayListOf(
        Bar(0, 100, 0.809f, 0.616f),
        Bar(200, 300, 0.809f, 0.619f),
        Bar(550, 650, 0.591f, 0.309f),
      ),
  )
val ENVELOPE_PRESET =
  Preset(
    name = "Envelope",
    points =
      arrayListOf(
        EnvelopePoint(1.0f, 0.8f, 0),
        EnvelopePoint(0.0f, 0.8f, 500),
        EnvelopePoint(0.0f, 0.8f, 1000),
        EnvelopePoint(1.0f, 0.8f, 2000),
        EnvelopePoint(0.0f, 0.8f, 2000),
      ),
  )
val FALLING_BRICKS =
  Preset(
    name = "Falling Bricks",
    bars =
      arrayListOf(
        Bar(0, 100, 1f, 1f),
        Bar(200, 300, 0.675f, 0.675f),
        Bar(400, 500, 0.406f, 0.2f),
        Bar(600, 700, 0.659f, 0.659f),
        Bar(800, 900, 0.941f, 0.941f),
      ),
  )
val EARTHQUAKE_PRESET =
  Preset(
    name = "Earthquake",
    points =
      arrayListOf(
        EnvelopePoint(0f, 1f, 0),
        EnvelopePoint(0.8f, 1f, 400),
        EnvelopePoint(0f, 1f, 400),
        EnvelopePoint(0f, 1f, 500),
        EnvelopePoint(0.8f, 1f, 700),
        EnvelopePoint(0f, 1f, 700),
      ),
  )
val RANDOM_PRESET =
  Preset(
    name = "Random Preset",
    points =
      arrayListOf(
        EnvelopePoint(0f, 1f, 0),
        EnvelopePoint(0.8f, 1f, 400),
        EnvelopePoint(0f, 1f, 400),
        EnvelopePoint(0f, 1f, 500),
        EnvelopePoint(0.8f, 1f, 700),
        EnvelopePoint(0f, 1f, 700),
        EnvelopePoint(0f, 1f, 900),
        EnvelopePoint(1f, 0.9f, 900),
        EnvelopePoint(1f, 0.9f, 1000),
        EnvelopePoint(0f, 0.9f, 1000),
        EnvelopePoint(0f, 0.9f, 1100),
        EnvelopePoint(1f, 0.9f, 1100),
        EnvelopePoint(1f, 0.9f, 1200),
        EnvelopePoint(0f, 0.9f, 1200),
      ),
  )

val LONG_RISING_PRESET =
  Preset(
    name = "Long Rising",
    points =
      arrayListOf(
        EnvelopePoint(0f, 1f, 0),
        EnvelopePoint(1f, 1f, 10000),
        EnvelopePoint(0f, 1f, 10000),
      ),
  )

val UP_PRESET =
  Preset(
    name = "Up",
    points =
      arrayListOf(
        EnvelopePoint(0f, 1f, 0),
        EnvelopePoint(1f, 1f, 50), // 50ms
        EnvelopePoint(0f, 1f, 50),
        EnvelopePoint(0f, 1f, 1050),
        EnvelopePoint(1f, 1f, 1200), // 150ms
        EnvelopePoint(0f, 1f, 1200),
        EnvelopePoint(0f, 1f, 2200),
        EnvelopePoint(1f, 1f, 2500), // 300ms
        EnvelopePoint(0f, 1f, 2500),
        EnvelopePoint(0f, 1f, 3500),
        EnvelopePoint(1f, 1f, 4100), // 600ms
        EnvelopePoint(0f, 1f, 4100),
        EnvelopePoint(0f, 1f, 5100),
        EnvelopePoint(1f, 1f, 6100), // 1000ms
        EnvelopePoint(0f, 1f, 6100),
        EnvelopePoint(0f, 1f, 7100),
        EnvelopePoint(1f, 1f, 10100), // 3000ms
        EnvelopePoint(0f, 1f, 10100),
      ),
  )

val UP_AND_DOWN_PRESET =
  Preset(
    name = "Up and Down",
    points =
      arrayListOf(
        EnvelopePoint(0f, 1f, 0),
        EnvelopePoint(1f, 1f, 50), // 50ms
        EnvelopePoint(0f, 1f, 100),
        EnvelopePoint(0f, 1f, 1100),
        EnvelopePoint(1f, 1f, 1250), // 150ms
        EnvelopePoint(0f, 1f, 1400),
        EnvelopePoint(0f, 1f, 2400),
        EnvelopePoint(1f, 1f, 2700), // 300ms
        EnvelopePoint(0f, 1f, 3000),
        EnvelopePoint(0f, 1f, 4000),
        EnvelopePoint(1f, 1f, 4600), // 600ms
        EnvelopePoint(0f, 1f, 5200),
        EnvelopePoint(0f, 1f, 6200),
        EnvelopePoint(1f, 1f, 7200), // 1000ms
        EnvelopePoint(0f, 1f, 8200),
        EnvelopePoint(0f, 1f, 9200),
        EnvelopePoint(1f, 1f, 12200), // 3000ms
        EnvelopePoint(0f, 1f, 15200),
      ),
  )

val COMPLEX =
  Preset(
    name = "Complex",
    bars =
      arrayListOf(
        Bar(200, 400, 1f, 1f),
        Bar(1200, 1400, 1f, 1f),
        Bar(2200, 2400, 1f, 1f),
        Bar(7200, 7400, 1f, 1f),
        Bar(8200, 8400, 1f, 1f),
        Bar(9200, 9400, 1f, 1f),
      ),
    points =
      arrayListOf(
        EnvelopePoint(0f, 1f, 0),
        EnvelopePoint(0.9f, 1f, 5000),
        EnvelopePoint(0f, 1f, 10000),
      ),
  )
