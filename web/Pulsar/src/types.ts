/**
 * Type definitions for the Haptics library
 */

/**
 * Supported haptic intensity levels
 */
export type HapticIntensity = 'light' | 'medium' | 'heavy'

/**
 * Configuration for a single haptic effect
 */
export interface HapticConfig {
  /**
   * Duration of the haptic in milliseconds
   */
  duration?: number

  /**
   * Intensity level of the haptic
   */
  intensity?: HapticIntensity

  /**
   * Delay before the haptic starts, in milliseconds
   */
  delay?: number

  /**
   * Whether to repeat the haptic pattern
   */
  loop?: boolean

  /**
   * Number of times to repeat (if loop is true)
   */
  loopCount?: number
}

/**
 * Predefined haptic patterns
 */
export interface HapticPattern {
  name: string
  description: string
  effects: HapticConfig[]
}

/**
 * Input for custom haptic pattern creation
 */
export interface HapticPatternInput {
  name: string
  effects: HapticConfig[]
}

/**
 * Status of haptic playback
 */
export type HapticStatus = 'idle' | 'playing' | 'paused' | 'stopped'

/**
 * Haptic device capabilities
 */
export interface HapticCapabilities {
  supported: boolean
  maxDuration: number
  supportedIntensities: HapticIntensity[]
  supportsPatterns: boolean
}
