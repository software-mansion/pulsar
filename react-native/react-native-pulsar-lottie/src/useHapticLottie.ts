import { useCallback } from 'react';
import { usePatternComposer } from 'react-native-pulsar';
import type { Pattern } from 'react-native-pulsar';
import type { HapticSource } from './types';

export interface UseHapticLottieOptions {
  /** Pattern or preset trigger to fire with the animation. */
  haptics?: HapticSource;
  /** Disable firing without unwiring. Default `true`. */
  hapticsEnabled?: boolean;
}

export interface HapticLottieHandle {
  /** Fire the haptic (call alongside your own `lottieRef.play()`). */
  play: () => void;
  /** Stop the haptic (call alongside pause/stop). */
  stop: () => void;
  /** Whether a pattern is parsed and ready (always `true` for preset sources). */
  isReady: boolean;
}

/**
 * Attach Pulsar haptics to a `LottieView` you already own, without swapping the
 * component. Pre-parses the pattern (warming the engine off the critical path)
 * and returns `play`/`stop` to call alongside your existing transport — e.g.
 * from `onAnimationLoaded`/`autoPlay` and your pause handler.
 *
 * This is the `pattern`-mode (aligned-start) path. For progress-driven
 * `realtime` sync with seek/loop, use {@link HapticLottieView}.
 */
export function useHapticLottie(options: UseHapticLottieOptions): HapticLottieHandle {
  const { haptics, hapticsEnabled = true } = options;
  const isPattern = typeof haptics === 'object' && haptics !== null;
  const composer = usePatternComposer(isPattern ? (haptics as Pattern) : undefined);

  const play = useCallback(() => {
    if (!hapticsEnabled || !haptics) {
      return;
    }
    if (typeof haptics === 'function') {
      haptics();
    } else if (composer.isParsed()) {
      composer.play();
    }
  }, [haptics, hapticsEnabled, composer]);

  const stop = useCallback(() => {
    if (isPattern) {
      composer.stop();
    }
  }, [isPattern, composer]);

  return { play, stop, isReady: isPattern ? composer.isParsed() : true };
}
