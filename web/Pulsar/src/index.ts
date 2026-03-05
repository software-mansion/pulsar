/**
 * @pulsar/haptics
 * A TypeScript library for playing haptics on web devices
 */

// Export types
export type {
  HapticIntensity,
  HapticConfig,
  HapticPattern,
  HapticPatternInput,
  HapticStatus,
  HapticCapabilities
} from './types'

// Export main haptics interface and functions
export { haptics, HapticsManager, playHaptic, playPattern, stopHaptic } from './haptics'

// Export utilities
export { isVibrationSupported, intensityToValue, mergeHapticConfig } from './utils'
