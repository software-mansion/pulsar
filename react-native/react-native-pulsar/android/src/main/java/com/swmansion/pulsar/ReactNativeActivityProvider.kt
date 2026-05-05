package com.swmansion.pulsar

import android.app.Activity
import com.facebook.react.bridge.ReactApplicationContext

class ReactNativeActivityProvider(
    private val reactContext: ReactApplicationContext,
) : ActivityProvider() {
    override fun getCurrentActivity(): Activity? {
        return reactContext.currentActivity
    }
}
