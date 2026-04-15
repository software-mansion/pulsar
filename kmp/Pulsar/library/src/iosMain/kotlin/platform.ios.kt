package com.swmansion.pulsar.kmp

import platform.UIKit.UIDevice

internal actual val platformName: String = "iOS"

internal actual val currentSystemVersion: String =
    "iOS ${UIDevice.currentDevice.systemVersion}"
