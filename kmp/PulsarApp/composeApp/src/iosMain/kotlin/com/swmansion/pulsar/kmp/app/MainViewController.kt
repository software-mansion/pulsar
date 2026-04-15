package com.swmansion.pulsar.kmp.app

import androidx.compose.ui.window.ComposeUIViewController
import com.swmansion.pulsar.kmp.Pulsar
import com.swmansion.pulsar.kmp.SwiftMessageProvider

interface IosSwiftMessageProvider {
    fun makeMessage(): String
}

fun MainViewController(swiftMessageProvider: IosSwiftMessageProvider) = ComposeUIViewController {
    Pulsar.registerSwiftMessageProvider(
        object : SwiftMessageProvider {
            override fun makeMessage(): String = swiftMessageProvider.makeMessage()
        }
    )
    App()
}
