package com.swmansion.pulsar.haptics

import com.swmansion.pulsar.audio.ContinuesPattern
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.audio.ConfigPoint
import com.swmansion.pulsar.audio.ValuePoint
import kotlin.collections.arrayListOf

val CONST_PLOT_SHARPNESS = arrayListOf(ValuePoint(0f, 1f))
val SUCCESS_PRESET =
  Preset(
    name = "Success",
    impulses =
      arrayListOf(
        ConfigPoint(0f, 0.809f, 0.616f),
        ConfigPoint(150f, 0.809f, 0.619f),
        ConfigPoint(453f, 1f, 1f),
      ),
  )

val FAIL_PRESET =
  Preset(
    name = "Fail",
    impulses =
      arrayListOf(
        ConfigPoint(0f, 0.809f, 0.616f),
        ConfigPoint(150f, 0.809f, 0.619f),
        ConfigPoint(453f, 0.591f, 0.309f),
      ),
  )

val ENVELOPE_PRESET =
  Preset(
    name = "Envelope",
    continuesPattern =
      ContinuesPattern(
        amplitude =
          arrayListOf(
            ValuePoint(0f, 0f),
            ValuePoint(0f, 1f),
            ValuePoint(500f, 0f),
            ValuePoint(1000f, 0f),
            ValuePoint(2000f, 1f),
            ValuePoint(2000f, 0f),
          ),
        frequency = CONST_PLOT_SHARPNESS,
      ),
  )
val FALLING_BRICKS =
  Preset(
    name = "Falling Bricks",
    impulses =
      arrayListOf(
        ConfigPoint(0f, 1f, 1f),
        ConfigPoint(149f, 0.675f, 0.675f),
        ConfigPoint(301f, 0.406f, 0.2f),
        ConfigPoint(501f, 0.659f, 0.659f),
        ConfigPoint(650f, 0.941f, 0.941f),
      ),
  )
val EARTHQUAKE_PRESET =
  Preset(
    name = "Earthquake",
    continuesPattern =
      ContinuesPattern(
        amplitude =
          arrayListOf(
            ValuePoint(0f, 0f),
            ValuePoint(300f, 0.8f),
            ValuePoint(300f, 0f),
            ValuePoint(400f, 0f),
            ValuePoint(600f, 0.8f),
            ValuePoint(600f, 0f),
            ValuePoint(1000f, 0f),
          ),
        frequency =
          arrayListOf(
            ValuePoint(0f, 0.8f),
            ValuePoint(600f, 0.8f)
          ),
      ),
  )
val RANDOM_PRESET =
  Preset(
    name = "Random",
    continuesPattern =
      ContinuesPattern(
        amplitude =
          arrayListOf(
            ValuePoint(0f, 0f),
            ValuePoint(300f, 0.8f),
            ValuePoint(300f, 0f),
            ValuePoint(400f, 0f),
            ValuePoint(600f, 0.8f),
            ValuePoint(600f, 0f),
            ValuePoint(1000f, 0f),
          ),
        frequency =
          arrayListOf(
            ValuePoint(0f, 0.8f),
            ValuePoint(600f, 0.8f)
          ),
      ),
    impulses =
      arrayListOf(
        ConfigPoint(834f, 0.834f, 0.3f),
        ConfigPoint(941f, 0.897f, 0.3f),
      ),
  )

val LONG_RISING_PRESET =
  Preset(
    name = "Long Rising",
    continuesPattern =
      ContinuesPattern(
        amplitude =
          arrayListOf(
            ValuePoint(0f, 0f),
            ValuePoint(10000f, 1f),
            ValuePoint(10000f, 0f)
          ),
        frequency = CONST_PLOT_SHARPNESS,
      ),
  )

val UP_PRESET =
  Preset(
    name = "Up",
    continuesPattern =
      ContinuesPattern(
        amplitude =
          arrayListOf(
            ValuePoint(0f, 0f),
            ValuePoint(50f, 1f), // 50ms
            ValuePoint(50f, 0f),
            ValuePoint(1050f, 0f),
            ValuePoint(1200f, 1f), // 150ms
            ValuePoint(1200f, 0f),
            ValuePoint(2200f, 0f),
            ValuePoint(2500f, 1f), // 300ms
            ValuePoint(2500f, 0f),
            ValuePoint(3500f, 0f),
            ValuePoint(4100f, 1f), // 600ms
            ValuePoint(4100f, 0f),
            ValuePoint(5100f, 0f),
            ValuePoint(6100f, 1f), // 1000ms
            ValuePoint(6100f, 0f),
            ValuePoint(7100f, 0f),
            ValuePoint(10100f, 1f), // 3000ms
            ValuePoint(10100f, 0f),
          ),
        frequency = CONST_PLOT_SHARPNESS,
      ),
  )

val UP_AND_DOWN_PRESET =
  Preset(
    name = "Up and Down",
    continuesPattern =
      ContinuesPattern(
        amplitude =
          arrayListOf(
            ValuePoint(0f, 0f),
            ValuePoint(50f, 1f), // 50ms
            ValuePoint(100f, 0f),
            ValuePoint(1100f, 0f),
            ValuePoint(1250f, 1f), // 150ms
            ValuePoint(1400f, 0f),
            ValuePoint(2400f, 0f),
            ValuePoint(2700f, 1f), // 300ms
            ValuePoint(3000f, 0f),
            ValuePoint(4000f, 0f),
            ValuePoint(4600f, 1f), // 600ms
            ValuePoint(5200f, 0f),
            ValuePoint(6200f, 0f),
            ValuePoint(7200f, 1f), // 1000ms
            ValuePoint(8200f, 0f),
            ValuePoint(9200f, 0f),
            ValuePoint(12200f, 1f), // 3000ms
            ValuePoint(15200f, 0f),
          ),
        frequency = CONST_PLOT_SHARPNESS,
      ),
  )

val COMPLEX_PRESET =
  Preset(
    name = "Complex",
    impulses =
      arrayListOf(
        ConfigPoint(200f, 1f, 1f),
        ConfigPoint(1200f, 1f, 1f),
        ConfigPoint(2200f, 1f, 1f),
        ConfigPoint(7200f, 1f, 1f),
        ConfigPoint(8200f, 1f, 1f),
        ConfigPoint(9200f, 1f, 1f),
      ),
    continuesPattern =
      ContinuesPattern(
        amplitude =
          arrayListOf(
            ValuePoint(0f, 0f),
            ValuePoint(5000f, 0.9f),
            ValuePoint(10000f, 0f)
          ),
        frequency = CONST_PLOT_SHARPNESS,
      ),
  )

val TEST_PRESET =
  Preset(
    name = "Test",
    impulses =
      arrayListOf(
        ConfigPoint(0f, 1f, 1f),
        ConfigPoint(400f, 0.4f, 1f),
        ConfigPoint(500f, 1f, 1f),
        ConfigPoint(600f, 0.4f, 1f),
        ConfigPoint(900f, 1f, 1f),
        ConfigPoint(1000f, 1f, 1f),
        ConfigPoint(1500f, 1f, 1f),
        ConfigPoint(1900f, 1f, 1f),
      ),
    continuesPattern =
      ContinuesPattern(
        amplitude =
          arrayListOf(
            ValuePoint(0f, 0f),
            ValuePoint(1000f, 0.5f),
            ValuePoint(2000f, 0f)
          ),
        frequency = CONST_PLOT_SHARPNESS,
      ),
  )

val FREQUENCY_PRESET =
  Preset(
    name = "Frequency",
    impulses =
      arrayListOf(
        ConfigPoint(400f, 1f, 0.1f),
        ConfigPoint(1400f, 0.8f, 0.1f),
        ConfigPoint(2400f, 1f, 0.1f),
        ConfigPoint(3400f, 0.8f, 0.1f),
      ),
    continuesPattern =
      ContinuesPattern(
        amplitude =
          arrayListOf(
            ValuePoint(0f, 0f),
            ValuePoint(0f, 0.5f),
            ValuePoint(4000f, 0.5f),
            ValuePoint(4000f, 0f),
          ),
        frequency =
          arrayListOf(
            ValuePoint(0f, 1f),
            ValuePoint(1000f, 0.75f),
            ValuePoint(2000f, 0.5f),
            ValuePoint(3000f, 0.25f),
          ),
      ),
  )

val MILK_PRESET =
  Preset(
    name = "Milk",
    continuesPattern =
      ContinuesPattern(
        amplitude =
          arrayListOf(
            ValuePoint(0f, 0f),
            ValuePoint(651f, 0.813f),
            ValuePoint(651f, 0f),
            ValuePoint(700f, 0f)
          ),
        frequency =
          arrayListOf(
            ValuePoint(0f, 0.7f),
          ),
      ),
    impulses =
      arrayListOf(
        ConfigPoint(13f, 0.897f, 0.209f),
        ConfigPoint(117f, 0.897f, 0.322f),
        ConfigPoint(253f, 0.903f, 0.484f),
        ConfigPoint(400f, 0.903f, 0.716f),
        ConfigPoint(546f, 0.906f, 0.803f),
        ConfigPoint(651f, 0.906f, 1f),
      ),
  )
