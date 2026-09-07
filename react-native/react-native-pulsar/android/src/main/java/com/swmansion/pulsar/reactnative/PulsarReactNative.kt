package com.swmansion.pulsar.reactnative

import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.presets.PresetsWrapper

class PulsarReactNative(context: Context) : Pulsar(context) {
    override fun createPresets(): PresetsWrapper =
        PresetsWrapper(this, ReactNativeActivityProvider(context as ReactApplicationContext), engine)

    // The engine already computes these to decide the compatibility mode; the bridge just
    // forwards them so JS can see the individual capabilities behind that single level.
    fun hasAmplitudeControl(): Boolean = engine.isAmplitudeSupported()

    fun hasPrimitiveSupport(): Boolean = engine.hasPrimitiveSupport()

    fun isEnvelopeSupported(): Boolean = engine.isEnvelopeSupported()

    fun isFrequencyProfileSupported(): Boolean = engine.isFrequencyProfileSupported()

    fun minControlPointDurationMillis(): Long = engine.getMinControlPointDurationMillis()
}
