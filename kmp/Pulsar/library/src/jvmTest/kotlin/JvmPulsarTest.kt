package com.swmansion.pulsar.kmp

import kotlin.test.Test
import kotlin.test.assertTrue

class JvmPulsarTest {

    @Test
    fun testPlatform() {
        assertTrue(Pulsar.platform.contains("JVM"))
    }
}
