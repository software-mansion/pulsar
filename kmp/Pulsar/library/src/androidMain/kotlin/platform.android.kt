package com.swmansion.pulsar.kmp

import android.os.Build

internal actual val platformName: String = "Android"

internal actual val currentSystemVersion: String =
    "Android ${Build.VERSION.RELEASE} (SDK ${Build.VERSION.SDK_INT})"
