package com.swmansion.pulsarapp

import com.swmansion.pulsarapp.types.Bar
import com.swmansion.pulsarapp.types.Point
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
        Point(0, 0f),
        Point(0, 1f),
        Point(500, 0f),
        Point(1000, 0f),
        Point(2000, 1f),
        Point(2000, 0f),
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
        Point(0, 0f),
        Point(400, 0.8f),
        Point(400, 0f),
        Point(500, 0f),
        Point(700, 0.8f),
        Point(700, 0f),
      ),
  )
val RANDOM_PRESET =
  Preset(
    name = "Random Preset",
    points =
      arrayListOf(
        Point(0, 0f),
        Point(400, 0.8f),
        Point(400, 0f),
        Point(500, 0f),
        Point(700, 0.8f),
        Point(700, 0f),
        Point(900, 0f),
        Point(900, 1f),
        Point(1000, 1f),
        Point(1000, 0f),
        Point(1100, 0f),
        Point(1100, 1f),
        Point(1200, 1f),
        Point(1200, 0f),
      ),
  )

val LONG_RISING_PRESET =
  Preset(
    name = "Long Rising",
    points =
      arrayListOf(
        Point(0, 0f),
        Point(10000, 1f),
        Point(10000, 0f)
      ),
  )

val UP_PRESET =
  Preset(
    name = "Up",
    points =
      arrayListOf(
        Point(0, 0f),
        Point(50, 1f), // 50ms
        Point(50, 0f),
        Point(1050, 0f),
        Point(1200, 1f), // 150ms
        Point(1200, 0f),
        Point(2200, 0f),
        Point(2500, 1f), // 300ms
        Point(2500, 0f),
        Point(3500, 0f),
        Point(4100, 1f), // 600ms
        Point(4100, 0f),
        Point(5100, 0f),
        Point(6100, 1f), // 1000ms
        Point(6100, 0f),
        Point(7100, 0f),
        Point(10100, 1f), // 3000ms
        Point(10100, 0f),
      ),
  )

val UP_AND_DOWN_PRESET =
  Preset(
    name = "Up and Down",
    points =
      arrayListOf(
        Point(0, 0f),
        Point(50, 1f), // 50ms
        Point(100, 0f),
        Point(1100, 0f),
        Point(1250, 1f), // 150ms
        Point(1400, 0f),
        Point(2400, 0f),
        Point(2700, 1f), // 300ms
        Point(3000, 0f),
        Point(4000, 0f),
        Point(4600, 1f), // 600ms
        Point(5200, 0f),
        Point(6200, 0f),
        Point(7200, 1f), // 1000ms
        Point(8200, 0f),
        Point(9200, 0f),
        Point(12200, 1f), // 3000ms
        Point(15200, 0f),
      ),
  )

val COMPLEX_PRESET =
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
        Point(0, 0f),
        Point(5000, 0.9f),
        Point(10000, 0f)
      ),
  )

val TEST_PRESET =
  Preset(
    name = "Test",
    bars =
      arrayListOf(
        Bar(0, 100, 1f, 1f),
        Bar(400, 500, 0.4f, 1f),
        Bar(500, 600, 1f, 1f),
        Bar(600, 700, 0.4f, 1f),
        Bar(900, 1000, 1f, 1f),
        Bar(1000, 1100, 1f, 1f),
        Bar(1500, 1600, 1f, 1f),
        Bar(1900, 2000, 1f, 1f),
      ),
    points = arrayListOf(
      Point(0, 0f),
      Point(1000, 0.5f),
      Point(2000, 0f)
    )
  )
