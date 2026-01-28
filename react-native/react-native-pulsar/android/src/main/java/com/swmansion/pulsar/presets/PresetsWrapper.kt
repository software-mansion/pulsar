package com.swmansion.pulsar.presets

import android.content.Context
import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.haptics.HapticEngineWrapper
import com.swmansion.pulsar.types.Preset

class PresetsWrapper(
    private val haptics: Pulsar,
    context: Context,
    engine: HapticEngineWrapper,
) {
    private var useCache: Boolean = true
    private val cache = mutableMapOf<String, Preset>()
    private val systemPrimitivePresets = SystemPrimitivePresets(engine)
    private val systemViewBasedPresets = SystemViewBasedPresets(context)

    private val mapper: Map<String, (Pulsar) -> Preset> = mapOf(
        EarthquakePreset.name to { haptics -> EarthquakePreset(haptics) },
        SuccessPreset.name to { haptics -> SuccessPreset(haptics) },
        FailPreset.name to { haptics -> FailPreset(haptics) },
        TapPreset.name to { haptics -> TapPreset(haptics) },

        SystemImpactLightPreset.name to { haptics -> SystemImpactLightPreset(haptics) },
        SystemImpactMediumPreset.name to { haptics -> SystemImpactMediumPreset(haptics) },
        SystemImpactHeavyPreset.name to { haptics -> SystemImpactHeavyPreset(haptics) },
        SystemImpactSoftPreset.name to { haptics -> SystemImpactSoftPreset(haptics) },
        SystemImpactRigidPreset.name to { haptics -> SystemImpactRigidPreset(haptics) },
        SystemNotificationSuccessPreset.name to { haptics -> SystemNotificationSuccessPreset(haptics) },
        SystemNotificationWarningPreset.name to { haptics -> SystemNotificationWarningPreset(haptics) },
        SystemNotificationErrorPreset.name to { haptics -> SystemNotificationErrorPreset(haptics) },

        SystemEffectClickPreset.name to { haptics -> SystemEffectClickPreset(haptics, systemPrimitivePresets) },
        SystemDoubleClickPreset.name to { haptics -> SystemDoubleClickPreset(haptics, systemPrimitivePresets) },
        SystemTickPreset.name to { haptics -> SystemTickPreset(haptics, systemPrimitivePresets) },
        SystemHeavyClickPreset.name to { haptics -> SystemHeavyClickPreset(haptics, systemPrimitivePresets) },

        SystemLongPressPreset.name to { haptics -> SystemLongPressPreset(haptics, systemViewBasedPresets) },
        SystemVirtualKeyPreset.name to { haptics -> SystemVirtualKeyPreset(haptics, systemViewBasedPresets) },
        SystemKeyboardTapPreset.name to { haptics -> SystemKeyboardTapPreset(haptics, systemViewBasedPresets) },
        SystemClockTickPreset.name to { haptics -> SystemClockTickPreset(haptics, systemViewBasedPresets) },
        SystemCalendarDatePreset.name to { haptics -> SystemCalendarDatePreset(haptics, systemViewBasedPresets) },
        SystemContextClickPreset.name to { haptics -> SystemContextClickPreset(haptics, systemViewBasedPresets) },
        SystemKeyboardPressPreset.name to { haptics -> SystemKeyboardPressPreset(haptics, systemViewBasedPresets) },
        SystemKeyboardReleasePreset.name to { haptics -> SystemKeyboardReleasePreset(haptics, systemViewBasedPresets) },
        SystemVirtualKeyReleasePreset.name to { haptics -> SystemVirtualKeyReleasePreset(haptics, systemViewBasedPresets) },
        SystemTextHandleMovePreset.name to { haptics -> SystemTextHandleMovePreset(haptics, systemViewBasedPresets) },
        SystemDragCrossingPreset.name to { haptics -> SystemDragCrossingPreset(haptics, systemViewBasedPresets) },
        SystemGestureStartPreset.name to { haptics -> SystemGestureStartPreset(haptics, systemViewBasedPresets) },
        SystemGestureEndPreset.name to { haptics -> SystemGestureEndPreset(haptics, systemViewBasedPresets) },
        SystemEdgeSqueezePreset.name to { haptics -> SystemEdgeSqueezePreset(haptics, systemViewBasedPresets) },
        SystemEdgeReleasePreset.name to { haptics -> SystemEdgeReleasePreset(haptics, systemViewBasedPresets) },
        SystemConfirmPreset.name to { haptics -> SystemConfirmPreset(haptics, systemViewBasedPresets) },
        SystemReleasePreset.name to { haptics -> SystemReleasePreset(haptics, systemViewBasedPresets) },
        SystemScrollTickPreset.name to { haptics -> SystemScrollTickPreset(haptics, systemViewBasedPresets) },
        SystemScrollItemFocusPreset.name to { haptics -> SystemScrollItemFocusPreset(haptics, systemViewBasedPresets) },
        SystemScrollLimitPreset.name to { haptics -> SystemScrollLimitPreset(haptics, systemViewBasedPresets) },
        SystemToggleOnPreset.name to { haptics -> SystemToggleOnPreset(haptics, systemViewBasedPresets) },
        SystemToggleOffPreset.name to { haptics -> SystemToggleOffPreset(haptics, systemViewBasedPresets) },
        SystemDragStartPreset.name to { haptics -> SystemDragStartPreset(haptics, systemViewBasedPresets) },
        SystemSegmentTickPreset.name to { haptics -> SystemSegmentTickPreset(haptics, systemViewBasedPresets) },
        SystemSegmentFrequentTickPreset.name to { haptics -> SystemSegmentFrequentTickPreset(haptics, systemViewBasedPresets) },
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

    
}
