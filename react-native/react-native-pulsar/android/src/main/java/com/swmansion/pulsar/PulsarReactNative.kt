package com.swmansion.pulsar

import android.app.Activity
import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.swmansion.pulsar.presets.PresetsWrapper
import java.lang.reflect.Constructor

class PulsarReactNative(context: Context) : Pulsar(context) {
    override fun getPresets(): PresetsWrapper {
        if (_presets == null) {
            val reactContext = context as ReactApplicationContext
            val descriptor = resolvedPresetsCtor
            val secondArgument: Any? = when (descriptor.secondArgKind) {
                SecondArgKind.ActivityProvider -> ReactNativeActivityProvider(reactContext)
                SecondArgKind.Activity -> reactContext.currentActivity
            }
            @Suppress("UNCHECKED_CAST")
            _presets = descriptor.constructor.newInstance(this, secondArgument, engine) as PresetsWrapper
        }
        return _presets!!
    }

    private enum class SecondArgKind { ActivityProvider, Activity }

    private data class PresetsCtorDescriptor(
        val constructor: Constructor<*>,
        val secondArgKind: SecondArgKind,
    )

    private companion object {
        /**
         * `PresetsWrapper`'s constructor signature differs between published
         * versions of the underlying `Pulsar` Android library: older builds
         * take an `android.app.Activity` as the second parameter, newer ones
         * take a `com.swmansion.pulsar.ActivityProvider`. Resolving once and
         * caching keeps cold start cheap (the reflection lookup ran on every
         * first-use of presets before this change was cached only via
         * `_presets`, which meant the call site still had to do the lookup
         * once per `Pulsar` instance).
         */
        val resolvedPresetsCtor: PresetsCtorDescriptor by lazy {
            val ctor = PresetsWrapper::class.java.constructors
                .firstOrNull { it.parameterTypes.size == 3 }
                ?: throw IllegalStateException("PresetsWrapper constructor not found")
            val kind = when (ctor.parameterTypes[1]) {
                ActivityProvider::class.java -> SecondArgKind.ActivityProvider
                Activity::class.java -> SecondArgKind.Activity
                else -> throw IllegalStateException(
                    "Unsupported PresetsWrapper constructor parameter: ${ctor.parameterTypes[1].name}"
                )
            }
            PresetsCtorDescriptor(ctor, kind)
        }
    }
}
