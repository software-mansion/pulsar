type HapticTimingCapabilities = {
  minPulseMs: number;
  maxPulseMs: number;
  minPauseMs: number;
  maxPauseMs: number;
};

/**
 * Returns the haptic timing capabilities used by the web engine.
 *
 * For now this is a static fallback profile, but it is intentionally wrapped
 * in a function so device-specific capability detection can be added later.
 */
const getHapticTimingCapabilities = (): HapticTimingCapabilities => ({
  minPulseMs: 20,
  maxPulseMs: 200,
  minPauseMs: 20,
  maxPauseMs: 200,
});

export { getHapticTimingCapabilities };
export type { HapticTimingCapabilities };
