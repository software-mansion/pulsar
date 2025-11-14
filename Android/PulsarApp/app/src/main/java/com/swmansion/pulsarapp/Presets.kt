package com.swmansion.pulsarapp

import com.swmansion.pulsarapp.types.Bar
import com.swmansion.pulsarapp.types.BarPreset

val SUCCESS_PRESET = BarPreset(
    name = "Success",
    bars = arrayListOf(
        Bar(0, 500, (0.5 * 255).toInt()),
        Bar(1000, 2000, (0.5 * 255).toInt()),
        Bar(2000, 2500, 1 * 255)
    )
)