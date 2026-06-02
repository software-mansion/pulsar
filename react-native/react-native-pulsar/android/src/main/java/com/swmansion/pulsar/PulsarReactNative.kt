package com.swmansion.pulsar

import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.swmansion.pulsar.presets.PresetsWrapper

class PulsarReactNative(context: Context) : Pulsar(context) {
    override fun createPresets(): PresetsWrapper =
        PresetsWrapper(this, ReactNativeActivityProvider(context as ReactApplicationContext), engine)
}
