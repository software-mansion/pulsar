package com.swmansion.pulsar.presets

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.types.Preset

class PresetsWrapper(
    private val haptics: Pulsar
) {
    private var useCache: Boolean = true
    private val cache = mutableMapOf<String, Preset>()

    private val mapper: Map<String, (Pulsar) -> Preset> = mapOf(
        EarthquakePreset.name to { haptics -> EarthquakePreset(haptics) },
        SuccessPreset.name to { haptics -> SuccessPreset(haptics) },
        FailPreset.name to { haptics -> FailPreset(haptics) },
        TapPreset.name to { haptics -> TapPreset(haptics) },
        SystemImpactLightPreset.name to { haptics -> SystemImpactLightPreset(haptics) },
    )

    fun enableCache(state: Boolean) {
        this.useCache = state
        if (!state) {
            resetCache()
        }
    }

    fun isCacheEnabled(): Boolean = this.useCache

    fun resetCache() {
        cache.clear()
    }

    fun preloadPresetByName(name: String) {
        this.useCache = true
        getCacheablePreset(name)
    }

    fun getByName(name: String): Preset? {
        return getCacheablePreset(name)
    }

    private fun getCacheablePreset(name: String): Preset? {
        return if (useCache) {
            cache.getOrPut(name) {
                mapper[name]?.invoke(haptics) ?: return null
            }
        } else {
            mapper[name]?.invoke(haptics) ?: return null
        }
    }

    fun Earthquake() {
        getCacheablePreset(EarthquakePreset.name)!!.play()
    }

    fun Success() {
        getCacheablePreset(SuccessPreset.name)!!.play()
    }

    fun Fail() {
        getCacheablePreset(FailPreset.name)!!.play()
    }

    fun Tap() {
        getCacheablePreset(TapPreset.name)!!.play()
    }

    fun SystemImpactLight() {
//        mapper["SystemImpactLight"]?.invoke(haptics)?.play()
//        getCacheablePreset(EarthquakePreset.name)?.play()
    }
}
