package com.swmansion.pulsar.composers

import com.swmansion.pulsar.haptics.HapticEngineWrapper
import com.swmansion.pulsar.types.CompatibilityMode
import com.swmansion.pulsar.types.RealtimeComposable
import com.swmansion.pulsar.types.RealtimeComposerStrategy

class RealtimeComposer(
    engine: HapticEngineWrapper,
    strategy: RealtimeComposerStrategy = RealtimeComposerStrategy.ENVELOPE_WITH_DISCRETE_PRIMITIVES,
    compatibilityMode: CompatibilityMode,
) : RealtimeComposable {

    var delegate: RealtimeComposable = when (strategy) {
        RealtimeComposerStrategy.ENVELOPE -> RealtimeEnvelopeComposer(engine)
        RealtimeComposerStrategy.ENVELOPE_WITH_DISCRETE_PRIMITIVES -> RealtimeEnvelopeWithDiscretePrimitivesComposer(engine)
        RealtimeComposerStrategy.PRIMITIVE_TICK -> RealtimePrimitiveTickComposer(engine, compatibilityMode)
        RealtimeComposerStrategy.PRIMITIVE_COMPLEX -> RealtimePrimitiveComplexComposer(engine, compatibilityMode)
    }

    override fun set(amplitude: Float, frequency: Float) {
        delegate.set(amplitude, frequency)
    }

    override fun playDiscrete(amplitude: Float, frequency: Float) {
        delegate.playDiscrete(amplitude, frequency)
    }

    override fun stop() {
        delegate.stop()
    }

    override fun isActive(): Boolean {
        return delegate.isActive()
    }
}
