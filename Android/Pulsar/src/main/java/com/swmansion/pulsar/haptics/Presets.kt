package com.swmansion.pulsar.haptics

import com.swmansion.pulsar.types.Impulse
import com.swmansion.pulsar.types.IntensityPoint
import com.swmansion.pulsar.types.Plot
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.SharpnessPoint
import kotlin.collections.arrayListOf

val CONST_PLOT_SHARPNESS = arrayListOf(SharpnessPoint(0, 1f))
val SUCCESS_PRESET =
  Preset(
    name = "Success",
    impulses =
      arrayListOf(
        Impulse(0, 0.809f, 0.616f),
        Impulse(150, 0.809f, 0.619f),
        Impulse(453, 1f, 1f),
      ),
  )

val FAIL_PRESET =
  Preset(
    name = "Fail",
    impulses =
      arrayListOf(
        Impulse(0, 0.809f, 0.616f),
        Impulse(150, 0.809f, 0.619f),
        Impulse(453, 0.591f, 0.309f),
      ),
  )

val ENVELOPE_PRESET =
  Preset(
    name = "Envelope",
    plot =
      Plot(
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
    impulses =
      arrayListOf(
        Impulse(0, 1f, 1f),
        Impulse(149, 0.675f, 0.675f),
        Impulse(301, 0.406f, 0.2f),
        Impulse(501, 0.659f, 0.659f),
        Impulse(650, 0.941f, 0.941f),
      ),
  )
val EARTHQUAKE_PRESET =
  Preset(
    name = "Earthquake",
    plot =
      Plot(
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
      Plot(
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
    impulses =
      arrayListOf(
        Impulse(834, 0.834f, 0.3f),
        Impulse(941, 0.897f, 0.3f),
      ),
  )

val LONG_RISING_PRESET =
  Preset(
    name = "Long Rising",
    plot =
      Plot(
        intensity =
          arrayListOf(
            IntensityPoint(0, 0f),
            IntensityPoint(10000, 1f),
            IntensityPoint(10000, 0f)
          ),
        sharpness = CONST_PLOT_SHARPNESS,
      ),
  )

val UP_PRESET =
  Preset(
    name = "Up",
    plot =
      Plot(
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
      Plot(
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
    impulses =
      arrayListOf(
        Impulse(200, 1f, 1f),
        Impulse(1200, 1f, 1f),
        Impulse(2200, 1f, 1f),
        Impulse(7200, 1f, 1f),
        Impulse(8200, 1f, 1f),
        Impulse(9200, 1f, 1f),
      ),
    plot =
      Plot(
        intensity =
          arrayListOf(
            IntensityPoint(0, 0f),
            IntensityPoint(5000, 0.9f),
            IntensityPoint(10000, 0f)
          ),
        sharpness = CONST_PLOT_SHARPNESS,
      ),
  )

val TEST_PRESET =
  Preset(
    name = "Test",
    impulses =
      arrayListOf(
        Impulse(0, 1f, 1f),
        Impulse(400, 0.4f, 1f),
        Impulse(500, 1f, 1f),
        Impulse(600, 0.4f, 1f),
        Impulse(900, 1f, 1f),
        Impulse(1000, 1f, 1f),
        Impulse(1500, 1f, 1f),
        Impulse(1900, 1f, 1f),
      ),
    plot =
      Plot(
        intensity =
          arrayListOf(
            IntensityPoint(0, 0f),
            IntensityPoint(1000, 0.5f),
            IntensityPoint(2000, 0f)
          ),
        sharpness = CONST_PLOT_SHARPNESS,
      ),
  )

val FREQUENCY_PRESET =
  Preset(
    name = "Frequency",
    impulses =
      arrayListOf(
        Impulse(400, 1f, 0.1f),
        Impulse(1400, 0.8f, 0.1f),
        Impulse(2400, 1f, 0.1f),
        Impulse(3400, 0.8f, 0.1f),
      ),
    plot =
      Plot(
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
      Plot(
        intensity =
          arrayListOf(
            IntensityPoint(0, 0f),
            IntensityPoint(651, 0.813f),
            IntensityPoint(651, 0f),
            IntensityPoint(700, 0f)
          ),
        sharpness =
          arrayListOf(
            SharpnessPoint(0, 0.7f),
          ),
      ),
    impulses =
      arrayListOf(
        Impulse(13, 0.897f, 0.209f),
        Impulse(117, 0.897f, 0.322f),
        Impulse(253, 0.903f, 0.484f),
        Impulse(400, 0.903f, 0.716f),
        Impulse(546, 0.906f, 0.803f),
        Impulse(651, 0.906f, 1f),
      ),
  )
