import type {
  HapticConfig,
  HapticPattern,
  HapticPatternInput,
  HapticStatus,
  HapticCapabilities,
  HapticIntensity
} from './types'
import {
  isVibrationSupported,
  mergeHapticConfig,
  configToVibratePattern
} from './utils'

/**
 * Core haptics library for web
 */
class HapticsManager {
  private status: HapticStatus = 'idle'
  private patterns: Map<string, HapticPattern> = new Map()
  private currentPatternId: string | null = null

  constructor() {
    this.initializeDefaultPatterns()
  }

  /**
   * Play a single haptic effect
   */
  play(config: HapticConfig = {}): void {
    if (!isVibrationSupported()) {
      console.warn('Vibration API is not supported on this device')
      return
    }

    const mergedConfig = mergeHapticConfig(config)
    const pattern = configToVibratePattern(mergedConfig)

    try {
      navigator.vibrate(pattern)
      this.status = 'playing'

      // Reset status after pattern completes
      setTimeout(() => {
        if (this.status === 'playing' && this.currentPatternId === null) {
          this.status = 'idle'
        }
      }, this.getPatternDuration(mergedConfig))
    } catch (error) {
      console.error('Failed to trigger haptic:', error)
      this.status = 'idle'
    }
  }

  /**
   * Stop current haptic
   */
  stop(): void {
    try {
      navigator.vibrate(0)
      this.status = 'stopped'
      this.currentPatternId = null
    } catch (error) {
      console.error('Failed to stop haptic:', error)
    }
  }

  /**
   * Pause current haptic (can be resumed)
   */
  pause(): void {
    try {
      navigator.vibrate(0)
      this.status = 'paused'
    } catch (error) {
      console.error('Failed to pause haptic:', error)
    }
  }

  /**
   * Resume paused haptic
   */
  resume(): void {
    if (this.status === 'paused' && this.currentPatternId) {
      const pattern = this.patterns.get(this.currentPatternId)
      if (pattern) {
        this.playPattern(this.currentPatternId)
      }
    }
  }

  /**
   * Play a registered pattern by ID
   */
  playPattern(patternId: string): void {
    const pattern = this.patterns.get(patternId)
    if (!pattern) {
      console.warn(`Pattern "${patternId}" not found`)
      return
    }

    this.currentPatternId = patternId
    this.playPatternSequence(pattern.effects)
  }

  /**
   * Play a sequence of haptic configs
   */
  private playPatternSequence(effects: HapticConfig[]): void {
    if (effects.length === 0) return

    const playNext = (index: number) => {
      if (index >= effects.length) {
        this.status = 'idle'
        this.currentPatternId = null
        return
      }

      const effect = effects[index]
      if (!effect) return
      
      const config = mergeHapticConfig(effect)
      const pattern = configToVibratePattern(config)

      try {
        navigator.vibrate(pattern)
        this.status = 'playing'

        const nextDelay = this.getPatternDuration(config) + (effects[index + 1]?.delay ?? 0)
        setTimeout(() => playNext(index + 1), nextDelay)
      } catch (error) {
        console.error('Failed to play pattern sequence:', error)
        this.status = 'idle'
      }
    }

    playNext(0)
  }

  /**
   * Register a custom haptic pattern
   */
  registerPattern(input: HapticPatternInput): void {
    if (!input.name || !input.effects || input.effects.length === 0) {
      throw new Error('Pattern must have a name and at least one effect')
    }

    this.patterns.set(input.name, {
      name: input.name,
      description: input.name,
      effects: input.effects
    })
  }

  /**
   * Get a registered pattern
   */
  getPattern(patternId: string): HapticPattern | undefined {
    return this.patterns.get(patternId)
  }

  /**
   * Get all registered patterns
   */
  getAllPatterns(): HapticPattern[] {
    return Array.from(this.patterns.values())
  }

  /**
   * Get current playback status
   */
  getStatus(): HapticStatus {
    return this.status
  }

  /**
   * Get device capabilities
   */
  getCapabilities(): HapticCapabilities {
    const supported = isVibrationSupported()
    return {
      supported,
      maxDuration: 10000,
      supportedIntensities: ['light', 'medium', 'heavy'] as HapticIntensity[],
      supportsPatterns: supported
    }
  }

  /**
   * Calculate total duration of a haptic config
   */
  private getPatternDuration(config: ReturnType<typeof mergeHapticConfig>): number {
    if (config.loop && config.loopCount && config.loopCount > 1) {
      const gapDuration = Math.max(50, config.duration / 2)
      return (config.loopCount * config.duration) + ((config.loopCount - 1) * gapDuration)
    }
    return config.duration
  }

  /**
   * Initialize default haptic patterns
   */
  private initializeDefaultPatterns(): void {
    this.patterns.set('tap', {
      name: 'tap',
      description: 'A quick tap haptic',
      effects: [{ duration: 50, intensity: 'medium' }]
    })

    this.patterns.set('pulse', {
      name: 'pulse',
      description: 'A pulsing haptic pattern',
      effects: [
        { duration: 100, intensity: 'medium', delay: 0 },
        { duration: 100, intensity: 'light', delay: 50 }
      ]
    })

    this.patterns.set('success', {
      name: 'success',
      description: 'A success feedback haptic',
      effects: [
        { duration: 50, intensity: 'medium', delay: 0 },
        { duration: 50, intensity: 'light', delay: 50 },
        { duration: 100, intensity: 'heavy', delay: 50 }
      ]
    })

    this.patterns.set('warning', {
      name: 'warning',
      description: 'A warning feedback haptic',
      effects: [
        { duration: 200, intensity: 'heavy', delay: 0 },
        { duration: 200, intensity: 'medium', delay: 100 }
      ]
    })

    this.patterns.set('error', {
      name: 'error',
      description: 'An error feedback haptic',
      effects: [
        { duration: 80, intensity: 'heavy', delay: 0 },
        { duration: 80, intensity: 'heavy', delay: 50 },
        { duration: 80, intensity: 'heavy', delay: 50 }
      ]
    })
  }
}

// Export singleton instance
export const haptics = new HapticsManager()

// Also export the class for advanced use cases
export { HapticsManager }

/**
 * Convenience function to play a haptic
 */
export function playHaptic(config?: HapticConfig): void {
  haptics.play(config)
}

/**
 * Convenience function to play a pattern
 */
export function playPattern(patternId: string): void {
  haptics.playPattern(patternId)
}

/**
 * Convenience function to stop haptics
 */
export function stopHaptic(): void {
  haptics.stop()
}
