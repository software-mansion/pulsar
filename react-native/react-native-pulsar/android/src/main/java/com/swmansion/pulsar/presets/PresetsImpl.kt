package com.swmansion.pulsar.presets

import android.Manifest
import androidx.annotation.RequiresPermission
import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class EarthquakePreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuesPattern = listOf(
//            listOf(),
//            listOf(),
            listOf(listOf(0.1f, 0.3f), listOf(1.5f, 0.3f)),
            listOf(listOf(0.1f, 0.3f), listOf(1.5f, 0.3f)),
//            listOf(listOf(0.1 * 1000, 0.5), listOf(0.5 * 1000, 0.5))
//            listOf(listOf(0.0 * 1000, 1.0), listOf(0.5 * 1000, 0.5), listOf(0.6 * 1000, 0.5)),
//            listOf(listOf(0.0 * 1000, 0.5), listOf(0.5 * 1000, 0.5), listOf(0.6 * 1000, 0.5))
        ),
//        rawContinuesPattern = listOf(
//            listOf(),
//            listOf(),
//        ),
        rawDiscretePattern = listOf(
//            listOf(0.1f, 0.9f, 0.5f),
//            listOf(0.2f, 0.8f, 0.5f),
//            listOf(0.8f, 0.8f, 0.5f),
            listOf(1.0f, 1.0f, 1.0f),
//            listOf(1.5f, 1.0f, 1.0f),
        )
    )) {
    companion object: PresetWithName {
        override val name = "Earthquake"
    }
}

class SuccessPreset(haptics: Pulsar) :
    Preset,
    Player(haptics, PatternData(
        rawContinuesPattern = listOf(
            listOf(listOf(0.1f, 1.0f), listOf(0.5f, 0.5f), listOf(1.6f, 0.0f)),
            listOf(listOf(0.1f, 0.5f), listOf(0.5f, 0.5f), listOf(1.6f, 0.0f))
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

    override fun play() {
        val hapticData = PatternData(
            rawContinuesPattern = listOf(
                listOf(listOf(0.0f, 1.0f), listOf(0.5f, 1.0f)),
                listOf(listOf(0.0f, 0.3f), listOf(0.5f, 0.3f))
            ),
            rawDiscretePattern = listOf(
                listOf(0.0f, 1.0f, 0.3f),
                listOf(0.15f, 1.0f, 0.3f),
                listOf(0.3f, 1.0f, 0.3f)
            )
        )
//        haptics.PatternComposer().playPattern(hapticData)
    }
}

class TapPreset(private val haptics: Pulsar) : Preset {
    companion object: PresetWithName {
        override val name = "Tap"
    }
    override fun play() {
        val hapticData = PatternData(
            rawContinuesPattern = listOf(
                listOf(listOf(0.0f, 1.0f)),
                listOf(listOf(0.0f, 0.5f))
            ),
            rawDiscretePattern = listOf(listOf(0.0f, 1.0f, 0.5f))
        )
//        haptics.PatternComposer().playPattern(hapticData)
    }
}

// System Impact Presets

class SystemImpactLightPreset(private val haptics: Pulsar) : Preset {
    companion object: PresetWithName {
        override val name = "SystemImpactLight"
    }
    override fun play() {
        // TODO
        val hapticData = PatternData(
            rawContinuesPattern = listOf(
                listOf(listOf(0.0f, 0.3f), listOf(0.1f, 0.0f)),
                listOf(listOf(0.0f, 0.5f), listOf(0.1f, 0.5f))
            ),
            rawDiscretePattern = listOf(listOf(0.0f, 0.3f, 0.5f))
        )
//        haptics.PatternComposer().playPattern(hapticData)
    }
}
