import type { HapticIntensity, HapticConfig } from './types'

/**
 * Map intensity names to vibration values
 */
export const INTENSITY_MAP: Record<HapticIntensity, number> = {
  light: 50,
  medium: 100,
  heavy: 150
}

/**
 * Default haptic configuration
 */
export const DEFAULT_HAPTIC_CONFIG: Required<HapticConfig> = {
  duration: 100,
  intensity: 'medium',
  delay: 0,
  loop: false,
  loopCount: 1
}

/**
 * Convert intensity string to numeric value
 */
export function intensityToValue(intensity: HapticIntensity): number {
  return INTENSITY_MAP[intensity] || INTENSITY_MAP.medium
}

/**
 * Merge user config with defaults
 */
export function mergeHapticConfig(userConfig: HapticConfig): Required<HapticConfig> {
  return {
    ...DEFAULT_HAPTIC_CONFIG,
    ...userConfig,
    duration: userConfig.duration ?? DEFAULT_HAPTIC_CONFIG.duration,
    intensity: userConfig.intensity ?? DEFAULT_HAPTIC_CONFIG.intensity,
    delay: userConfig.delay ?? DEFAULT_HAPTIC_CONFIG.delay,
    loop: userConfig.loop ?? DEFAULT_HAPTIC_CONFIG.loop,
    loopCount: userConfig.loopCount ?? DEFAULT_HAPTIC_CONFIG.loopCount
  }
}

/**
 * Check if the Vibration API is supported
 */
export function isVibrationSupported(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator
}

/**
 * Convert intensity to millisecond pattern for Vibration API
 */
export function configToVibratePattern(config: Required<HapticConfig>): number | number[] {
  const intensity = intensityToValue(config.intensity)
  const pattern = Math.round((intensity / 150) * config.duration)

  if (config.loop && config.loopCount && config.loopCount > 1) {
    const loopPattern: number[] = []
    for (let i = 0; i < config.loopCount; i++) {
      loopPattern.push(pattern)
      if (i < config.loopCount - 1) {
        loopPattern.push(Math.max(50, pattern / 2)) // gap between repetitions
      }
    }
    return loopPattern
  }

  return pattern
}
