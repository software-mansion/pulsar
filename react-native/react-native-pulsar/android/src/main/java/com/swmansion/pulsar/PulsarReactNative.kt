package com.swmansion.pulsar

import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.swmansion.pulsar.presets.PresetsWrapper

class PulsarReactNative(context: Context) : Pulsar(context) {
    override fun getPresets(): PresetsWrapper {
        if (_presets == null) {
            val reactContext = context as ReactApplicationContext
            val constructor = PresetsWrapper::class.java.constructors.firstOrNull { it.parameterTypes.size == 3 }
                ?: throw IllegalStateException("PresetsWrapper constructor not found")
            val secondArgument = when (constructor.parameterTypes[1].name) {
                "com.swmansion.pulsar.ActivityProvider" -> ReactNativeActivityProvider(reactContext)
                "android.app.Activity" -> reactContext.currentActivity
                else -> throw IllegalStateException(
                    "Unsupported PresetsWrapper constructor parameter: ${constructor.parameterTypes[1].name}"
                )
            }
            @Suppress("UNCHECKED_CAST")
            _presets = constructor.newInstance(this, secondArgument, engine) as PresetsWrapper
        }
        return _presets!!
    }
}
