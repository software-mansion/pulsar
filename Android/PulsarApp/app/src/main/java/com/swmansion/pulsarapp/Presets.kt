package com.swmansion.pulsarapp

import com.swmansion.pulsarapp.types.Bar
import com.swmansion.pulsarapp.types.EnvelopePoint
import com.swmansion.pulsarapp.types.Preset
import kotlin.collections.arrayListOf

val SUCCESS_PRESET =
  Preset(
    name = "Success",
    barsList = arrayListOf(
      Bar(0, 100, 0.809f, 0.616f),
      Bar(200, 300, 0.809f, 0.619f),
      Bar(550, 650, 1f, 1f)),
  )
val FAIL_PRESET =
  Preset(
    name = "Fail",
    barsList =
      arrayListOf(
        Bar(0, 100, 0.809f, 0.616f),
        Bar(200, 300, 0.809f, 0.619f),
        Bar(550, 650, 0.591f, 0.309f)),
  )
val ENVELOPE_TEST_PRESET =
  Preset(
    name = "Envelope Test",
    pointsList =
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
    barsList = arrayListOf(
      Bar(0, 100, 1f, 1f),
      Bar(200, 300, 0.675f, 0.675f),
      Bar(400, 500, 0.406f, 0.2f),
      Bar(600, 700, 0.659f, 0.659f),
      Bar(800, 900, 0.941f, 0.941f)
    )
  )
val EARTHQUAKE_PRESET =
  Preset(
    name = "Earthquake",
    pointsList = arrayListOf(
      EnvelopePoint(0f, 1f, 0),
      EnvelopePoint(0.8f, 1f, 400),
      EnvelopePoint(0f, 1f, 400),
      EnvelopePoint(0f, 1f, 500),
      EnvelopePoint(0.8f, 1f, 700),
      EnvelopePoint(0f, 1f, 700),
      )
  )
val RANDOM_PRESET =
  Preset(
    name = "Random Preset",
    pointsList = arrayListOf(
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
      )
  )