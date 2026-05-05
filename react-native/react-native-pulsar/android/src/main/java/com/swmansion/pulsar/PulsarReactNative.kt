package com.swmansion.pulsar

import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.swmansion.pulsar.presets.PresetsWrapper

class PulsarReactNative(context: Context) : Pulsar(context) {
    override fun getPresets(): PresetsWrapper {
        if (_presets == null) {
            val reactContext = context as ReactApplicationContext
            _presets = PresetsWrapper(this, ReactNativeActivityProvider(reactContext), engine)
        }
        return _presets!!
    }
}
