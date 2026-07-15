package com.swmansion.pulsar.haptics

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Covers how the minimum control-point duration — and therefore the width of every impulse peak —
 * is picked per device tier.
 *
 * The reason this is not one constant: on hardware that cannot play primitives, a control point
 * degrades to a bare on/off motor pulse, and a sluggish actuator needs time to spin up before
 * anything is felt. A peak sized for envelope hardware is silent there.
 */
class HapticEngineWrapperTest {

    private fun resolve(
        isEnvelopeSupported: Boolean = false,
        hasPrimitiveSupport: Boolean = true,
        vendorMin: Long? = null,
    ) = HapticEngineWrapper.resolveMinControlPointDuration(
        isEnvelopeSupported = isEnvelopeSupported,
        hasPrimitiveSupport = hasPrimitiveSupport,
        vendorMinControlPointDurationMillis = vendorMin,
    )

    @Test
    fun trustsTheVendorFigureOnEnvelopeHardware() {
        assertEquals(8L, resolve(isEnvelopeSupported = true, vendorMin = 8L))
    }

    @Test
    fun fallsBackToTheDefaultWhenEnvelopeHardwareReportsNothing() {
        assertEquals(
            HapticEngineWrapper.DEFAULT_MIN_CONTROL_POINT_DURATION_MS,
            resolve(isEnvelopeSupported = true, vendorMin = null),
        )
    }

    @Test
    fun keepsShortPeaksOnAModernActuatorWithoutEnvelopeSupport() {
        // Primitive support means a fast LRA — it can render a crisp transient, it just lacks the
        // newer envelope API.
        assertEquals(
            HapticEngineWrapper.DEFAULT_MIN_CONTROL_POINT_DURATION_MS,
            resolve(isEnvelopeSupported = false, hasPrimitiveSupport = true),
        )
    }

    @Test
    fun widensPeaksOnOldOrWeakActuatorsWithoutPrimitiveSupport() {
        // The moto g05 case: no primitives, so every impulse becomes a bare on/off pulse and a
        // 15 ms one is never felt.
        val weak = resolve(isEnvelopeSupported = false, hasPrimitiveSupport = false)

        assertEquals(HapticEngineWrapper.WEAK_ACTUATOR_MIN_CONTROL_POINT_DURATION_MS, weak)
        assertTrue(
            "weak actuators must get a wider peak than capable ones",
            weak > HapticEngineWrapper.DEFAULT_MIN_CONTROL_POINT_DURATION_MS,
        )
    }

    @Test
    fun envelopeHardwareIsNeverPenalisedForLackingPrimitives() {
        // Envelope support is the stronger signal: it reports a real resolution, so honour it.
        assertEquals(
            10L,
            resolve(isEnvelopeSupported = true, hasPrimitiveSupport = false, vendorMin = 10L),
        )
    }
}
