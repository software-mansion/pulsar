package com.swmansion.pulsar.kmp.app

interface Platform {
    val name: String
}

expect fun getPlatform(): Platform