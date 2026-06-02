package com.swmansion.pulsar.reactnative

import android.app.Activity
import com.facebook.react.bridge.ReactApplicationContext
import com.swmansion.pulsar.ActivityProvider

class ReactNativeActivityProvider(
    private val reactContext: ReactApplicationContext,
) : ActivityProvider() {
    override fun getCurrentActivity(): Activity? {
        return reactContext.currentActivity
    }
}
