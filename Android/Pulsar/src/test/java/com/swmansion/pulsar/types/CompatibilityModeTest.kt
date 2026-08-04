package com.swmansion.pulsar.types

import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * The SDK selects rendering strategies with ordinal comparisons like
 * `hapticSupport() >= CompatibilityMode.STANDARD_SUPPORT` (see `Pulsar.kt`). That only behaves as
 * intended while the enum stays ordered weakest → strongest, so pin the ordering here — reordering
 * the constants would silently break capability gating.
 */
class CompatibilityModeTest {

    @Test
    fun isOrderedFromWeakestToStrongest() {
        val expected = listOf(
            CompatibilityMode.NO_SUPPORT,
            CompatibilityMode.LIMITED_SUPPORT,
            CompatibilityMode.STANDARD_SUPPORT,
            CompatibilityMode.ADVANCED_SUPPORT,
        )
        assertTrue(expected.zipWithNext().all { (weaker, stronger) -> weaker < stronger })
    }

    @Test
    fun standardSupportGateIncludesAdvancedButNotLimited() {
        assertTrue(CompatibilityMode.ADVANCED_SUPPORT >= CompatibilityMode.STANDARD_SUPPORT)
        assertTrue(CompatibilityMode.STANDARD_SUPPORT >= CompatibilityMode.STANDARD_SUPPORT)
        assertTrue(CompatibilityMode.LIMITED_SUPPORT < CompatibilityMode.STANDARD_SUPPORT)
    }
}
