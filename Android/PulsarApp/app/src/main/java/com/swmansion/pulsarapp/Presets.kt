package com.swmansion.pulsarapp

import com.swmansion.pulsarapp.types.Bar
import com.swmansion.pulsarapp.types.IntensityPoint
import com.swmansion.pulsarapp.types.Preset
import com.swmansion.pulsarapp.types.PresetPlot
import com.swmansion.pulsarapp.types.SharpnessPoint
import kotlin.collections.arrayListOf

val CONST_PLOT_SHARPNESS = arrayListOf(SharpnessPoint(0, 1f))
val SUCCESS_PRESET =
  Preset(
    name = "Success",
    bars =
      arrayListOf(
        Bar(0, 50, 0.809f, 0.616f),
        Bar(150, 200, 0.809f, 0.619f),
        Bar(450, 500, 1f, 1f)
      ),
  )

val FAIL_PRESET =
  Preset(
    name = "Fail",
    bars =
      arrayListOf(
        Bar(0, 50, 0.809f, 0.616f),
        Bar(150, 200, 0.809f, 0.619f),
        Bar(450, 500, 0.591f, 0.309f),
      ),
  )

val ENVELOPE_PRESET =
  Preset(
    name = "Envelope",
    plot =
      PresetPlot(
        intensity =
          arrayListOf(
            IntensityPoint(0, 0f),
            IntensityPoint(0, 1f),
            IntensityPoint(500, 0f),
            IntensityPoint(1000, 0f),
            IntensityPoint(2000, 1f),
            IntensityPoint(2000, 0f),
          ),
        sharpness = CONST_PLOT_SHARPNESS,
      ),
  )
val FALLING_BRICKS =
  Preset(
    name = "Falling Bricks",
    bars =
      arrayListOf(
        Bar(0, 50, 1f, 1f),
        Bar(149, 199, 0.675f, 0.675f),
        Bar(301, 351, 0.406f, 0.2f),
        Bar(501, 551, 0.659f, 0.659f),
        Bar(650, 700, 0.941f, 0.941f),
      ),
  )
val EARTHQUAKE_PRESET =
  Preset(
    name = "Earthquake",
    plot =
      PresetPlot(
        intensity =
          arrayListOf(
            IntensityPoint(0, 0f),
            IntensityPoint(300, 0.8f),
            IntensityPoint(300, 0f),
            IntensityPoint(400, 0f),
            IntensityPoint(600, 0.8f),
            IntensityPoint(600, 0f),
            IntensityPoint(1000, 0f),
          ),
        sharpness = 
        arrayListOf(
          SharpnessPoint(0, 0.8f),
          SharpnessPoint(600, 0.8f)
        ),
      ),
  )
val RANDOM_PRESET =
  Preset(
    name = "Random",
    plot =
      PresetPlot(
        intensity =
          arrayListOf(
            IntensityPoint(0, 0f),
            IntensityPoint(300, 0.8f),
            IntensityPoint(300, 0f),
            IntensityPoint(400, 0f),
            IntensityPoint(600, 0.8f),
            IntensityPoint(600, 0f),
            IntensityPoint(1000, 0f),
          ),
        sharpness = 
          arrayListOf(
            SharpnessPoint(0, 0.8f),
            SharpnessPoint(600, 0.8f)
          ),
      ),
    bars = 
      arrayListOf(
        Bar(834, 884, 0.834f, 1f),
        Bar(941, 992, 0.897f, 1f)
      ),
  )

val LONG_RISING_PRESET =
  Preset(
    name = "Long Rising",
    plot =
      PresetPlot(
        intensity =
          arrayListOf(
            IntensityPoint(0, 0f),
            IntensityPoint(10000, 1f),
            IntensityPoint(10000, 0f)
          ),
        sharpness = CONST_PLOT_SHARPNESS
      ),
  )

val UP_PRESET =
  Preset(
    name = "Up",
    plot =
      PresetPlot(
        intensity =
          arrayListOf(
            IntensityPoint(0, 0f),
            IntensityPoint(50, 1f), // 50ms
            IntensityPoint(50, 0f),
            IntensityPoint(1050, 0f),
            IntensityPoint(1200, 1f), // 150ms
            IntensityPoint(1200, 0f),
            IntensityPoint(2200, 0f),
            IntensityPoint(2500, 1f), // 300ms
            IntensityPoint(2500, 0f),
            IntensityPoint(3500, 0f),
            IntensityPoint(4100, 1f), // 600ms
            IntensityPoint(4100, 0f),
            IntensityPoint(5100, 0f),
            IntensityPoint(6100, 1f), // 1000ms
            IntensityPoint(6100, 0f),
            IntensityPoint(7100, 0f),
            IntensityPoint(10100, 1f), // 3000ms
            IntensityPoint(10100, 0f),
          ),
        sharpness = CONST_PLOT_SHARPNESS,
      ),
  )

val UP_AND_DOWN_PRESET =
  Preset(
    name = "Up and Down",
    plot =
      PresetPlot(
        intensity =
          arrayListOf(
            IntensityPoint(0, 0f),
            IntensityPoint(50, 1f), // 50ms
            IntensityPoint(100, 0f),
            IntensityPoint(1100, 0f),
            IntensityPoint(1250, 1f), // 150ms
            IntensityPoint(1400, 0f),
            IntensityPoint(2400, 0f),
            IntensityPoint(2700, 1f), // 300ms
            IntensityPoint(3000, 0f),
            IntensityPoint(4000, 0f),
            IntensityPoint(4600, 1f), // 600ms
            IntensityPoint(5200, 0f),
            IntensityPoint(6200, 0f),
            IntensityPoint(7200, 1f), // 1000ms
            IntensityPoint(8200, 0f),
            IntensityPoint(9200, 0f),
            IntensityPoint(12200, 1f), // 3000ms
            IntensityPoint(15200, 0f),
          ),
        sharpness = CONST_PLOT_SHARPNESS,
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
    plot =
      PresetPlot(
        intensity =
          arrayListOf(
            IntensityPoint(0, 0f),
            IntensityPoint(5000, 0.9f),
            IntensityPoint(10000, 0f)
          ),
        sharpness = CONST_PLOT_SHARPNESS
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
    plot =
      PresetPlot(
        intensity =
          arrayListOf(
            IntensityPoint(0, 0f),
            IntensityPoint(1000, 0.5f),
            IntensityPoint(2000, 0f)
          ),
        sharpness = CONST_PLOT_SHARPNESS
      ),
  )

val FREQUENCY_PRESET =
  Preset(
    name = "Frequency",
    bars =
      arrayListOf(
        Bar(400, 600, 1f, 0.1f),
        Bar(1400, 1600, 0.8f, 0.1f),
        Bar(2400, 2600, 1f, 0.1f),
        Bar(3400, 3600, 0.8f, 0.1f),
      ),
    plot =
      PresetPlot(
        intensity =
          arrayListOf(
            IntensityPoint(0, 0f),
            IntensityPoint(0, 0.5f),
            IntensityPoint(4000, 0.5f),
            IntensityPoint(4000, 0f),
          ),
        sharpness =
          arrayListOf(
            SharpnessPoint(0, 1f),
            SharpnessPoint(1000, 0.75f),
            SharpnessPoint(2000, 0.5f),
            SharpnessPoint(3000, 0.25f),
          ),
      ),
  )

val MILK_PRESET =
  Preset(
    name = "Milk",
    plot =
      PresetPlot(
        intensity =
          arrayListOf(
            IntensityPoint(0, 0f),
            IntensityPoint(850, 0.813f),
            IntensityPoint(850, 0f),
            ),
        sharpness =
          arrayListOf(
            SharpnessPoint(0, 0.7f),
          ),
      ),
    bars =
      arrayListOf(
        Bar(50, 100, 0.897f, 0.209f),
        Bar(200, 250, 0.897f, 0.322f),
        Bar(350, 400, 0.903f, 0.484f),
        Bar(500, 550, 0.903f, 0.716f),
        Bar(650, 700, 0.906f, 0.803f),
        Bar(800, 850, 0.906f, 1f),
      ),
  )
