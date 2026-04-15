package com.swmansion.pulsar.kmp

import kotlin.test.Test
import kotlin.test.assertTrue

class PulsarTest {

    @Test
    fun `platform name is available`() {
        assertTrue(Pulsar.platform.isNotBlank())
    }

    @Test
    fun `system version is available`() {
        assertTrue(Pulsar.systemVersion.isNotBlank())
    }
}
