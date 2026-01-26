package com.swmansion.pulsar.presets

import android.Manifest
import android.os.Build
import androidx.annotation.RequiresApi
import androidx.annotation.RequiresPermission
import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.types.PatternData

@RequiresApi(Build.VERSION_CODES.O)
class EarthquakePreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuesPattern = listOf(
            listOf(),
            listOf(),
//            listOf(listOf(0.1 * 1000, 0.5), listOf(0.5 * 1000, 0.5))
//            listOf(listOf(0.1 * 1000, 1.0), listOf(0.5 * 1000, 0.5)),
//            listOf(listOf(0.1 * 1000, 0.5), listOf(0.5 * 1000, 0.5))
//            listOf(listOf(0.0 * 1000, 1.0), listOf(0.5 * 1000, 0.5), listOf(0.6 * 1000, 0.5)),
//            listOf(listOf(0.0 * 1000, 0.5), listOf(0.5 * 1000, 0.5), listOf(0.6 * 1000, 0.5))
        ),
//        rawContinuesPattern = listOf(
//            listOf(),
//            listOf(),
//        ),
        rawDiscretePattern = listOf(
            listOf(0.1 * 1000, 0.9, 0.5),
            listOf(0.2 * 1000, 0.8, 0.5),
            listOf(0.8 * 1000, 0.8, 0.5),
            listOf(1.0 * 1000, 0.8, 0.5),
            listOf(1.5 * 1000, 1.0, 1.0),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Earthquake"
    }
}

@RequiresApi(Build.VERSION_CODES.O)
class SuccessPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuesPattern = listOf(
            listOf(listOf(0.1 * 1000, 1.0), listOf(0.5 * 1000, 0.5), listOf(1.6 * 1000, 0.0)),
            listOf(listOf(0.1 * 1000, 0.5), listOf(0.5 * 1000, 0.5), listOf(1.6 * 1000, 0.0))
        ),
        rawDiscretePattern = listOf(
//            listOf(0.1 * 2000, 0.9, 0.5),
//            listOf(0.2 * 2000, 0.8, 0.5),
//            listOf(0.8 * 2000, 0.8, 0.5),
//            listOf(1.0 * 2000, 0.8, 0.5),
//            listOf(1.5 * 2000, 1.0, 1.0),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Success"
    }
}

class FailPreset(private val haptics: Pulsar) : Preset {
    companion object: PresetWithName {
        override val name = "Fail"
    }
    @RequiresApi(Build.VERSION_CODES.O)
    @RequiresPermission(Manifest.permission.VIBRATE)
    override fun play() {
        val hapticData = PatternData(
            rawContinuesPattern = listOf(
                listOf(listOf(0.0, 1.0), listOf(0.5, 1.0)),
                listOf(listOf(0.0, 0.3), listOf(0.5, 0.3))
            ),
            rawDiscretePattern = listOf(
                listOf(0.0, 1.0, 0.3),
                listOf(0.15, 1.0, 0.3),
                listOf(0.3, 1.0, 0.3)
            )
        )
        haptics.PatternComposer().playPattern(hapticData)
    }
}

class TapPreset(private val haptics: Pulsar) : Preset {
    companion object: PresetWithName {
        override val name = "Tap"
    }
    @RequiresApi(Build.VERSION_CODES.O)
    @RequiresPermission(Manifest.permission.VIBRATE)
    override fun play() {
        val hapticData = PatternData(
            rawContinuesPattern = listOf(
                listOf(listOf(0.0, 1.0)),
                listOf(listOf(0.0, 0.5))
            ),
            rawDiscretePattern = listOf(listOf(0.0, 1.0, 0.5))
        )
        haptics.PatternComposer().playPattern(hapticData)
    }
}

// System Impact Presets

class SystemImpactLightPreset(private val haptics: Pulsar) : Preset {
    companion object: PresetWithName {
        override val name = "SystemImpactLight"
    }
    @RequiresApi(Build.VERSION_CODES.O)
    @RequiresPermission(Manifest.permission.VIBRATE)
    override fun play() {
        // TODO
        val hapticData = PatternData(
            rawContinuesPattern = listOf(
                listOf(listOf(0.0, 0.3), listOf(0.1, 0.0)),
                listOf(listOf(0.0, 0.5), listOf(0.1, 0.5))
            ),
            rawDiscretePattern = listOf(listOf(0.0, 0.3, 0.5))
        )
        haptics.PatternComposer().playPattern(hapticData)
    }
}
