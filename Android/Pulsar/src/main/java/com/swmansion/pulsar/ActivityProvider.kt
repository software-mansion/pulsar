package com.swmansion.pulsar

import android.app.Activity

open class ActivityProvider(
    private val activity: Activity? = null,
) {
    open fun getCurrentActivity(): Activity? {
        return activity
    }
}
