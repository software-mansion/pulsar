package com.swmansion.pulsar

import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.swmansion.pulsar.presets.PresetsWrapper

class PulsarReactNative(context: Context) : Pulsar(context) {
    override fun getPresets(): PresetsWrapper {
        if (_presets == null) {
            val activity = (context as ReactApplicationContext).currentActivity
            _presets = PresetsWrapper(this, activity, engine)
        }
        return _presets!!
    }
}