package com.swmansion.pulsar.reactnative

import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.PresetsWrapper

data class HapticCapabilities(
    val hasAmplitudeControl: Boolean,
    val hasPrimitiveSupport: Boolean,
    val isEnvelopeSupported: Boolean,
    val isFrequencyProfileSupported: Boolean,
    val minControlPointDurationMillis: Long,
)

class PulsarReactNative(context: Context) : Pulsar(context) {
    override fun createPresets(): PresetsWrapper =
        PresetsWrapper(this, ReactNativeActivityProvider(context as ReactApplicationContext), engine)

    fun hapticCapabilities(): HapticCapabilities =
        HapticCapabilities(
            hasAmplitudeControl = engine.isAmplitudeSupported(),
            hasPrimitiveSupport = engine.hasPrimitiveSupport(),
            isEnvelopeSupported = engine.isEnvelopeSupported(),
            isFrequencyProfileSupported = engine.isFrequencyProfileSupported(),
            minControlPointDurationMillis = engine.getMinControlPointDurationMillis(),
        )
}
