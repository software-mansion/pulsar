package com.swmansion.pulsarapp

import com.swmansion.pulsarapp.types.Bar
import com.swmansion.pulsarapp.types.Preset
import com.swmansion.pulsarapp.types.EnvelopePoint
import kotlin.collections.arrayListOf

val SUCCESS_PRESET = Preset(
    name = "Success",
    bars = arrayListOf(
        Bar(0, 300, (0.8 * 255).toInt()),
        Bar(400, 500, (0.6 * 255).toInt()),
        Bar(600, 700, (0.6 * 255).toInt())
    )
)

val FAILURE_PRESET = Preset(
    name = "Failure",
    bars = arrayListOf(
        Bar(0, 200, (0.3 * 255).toInt()),
        Bar(300, 500, (0.6 * 255).toInt()),
        Bar(600, 800, 1 * 255)
    )
)

val ENVELOPE_PRESET = Preset(
    name = "Envelope",
    controlPoints = arrayListOf(
        EnvelopePoint(1.0f, 0.8f, 1200),
        EnvelopePoint(0.0f, 0.8f, 1200),
        EnvelopePoint(0.0f, 0.8f, 1400),
        EnvelopePoint(1.0f, 0.8f, 2000),
        )
)