import { useCallback } from 'react';
import { usePatternComposer } from 'react-native-pulsar';
import type { Pattern, PresetHandle } from 'react-native-pulsar';
import type { HapticSource } from './types';

export interface UseHapticLottieOptions {
  /**
   * A bundle preset to fire with the animation. Supplies `haptics` from its pattern, and
   * plays its synced audio too when it was authored with any.
   */
  preset?: PresetHandle;
  /** Pattern or preset trigger to fire with the animation. Overrides `preset`. */
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
  const { preset, hapticsEnabled = true } = options;
  const haptics = options.haptics ?? preset?.pattern;
  // An audio preset the caller did not override plays through its own handle, so the native
  // engine drives the haptics and the synced audio together.
  const usePresetPlayback = options.haptics === undefined && !!preset?.hasAudio;
  const isPattern = !usePresetPlayback && typeof haptics === 'object' && haptics !== null;
  const composer = usePatternComposer(isPattern ? (haptics as Pattern) : undefined);

  const play = useCallback(() => {
    if (!hapticsEnabled) {
      return;
    }
    if (usePresetPlayback) {
      preset?.play();
    } else if (typeof haptics === 'function') {
      haptics();
    } else if (haptics && composer.isParsed()) {
      composer.play();
    }
  }, [haptics, hapticsEnabled, composer, preset, usePresetPlayback]);

  const stop = useCallback(() => {
    if (usePresetPlayback) {
      preset?.stop();
    } else if (isPattern) {
      composer.stop();
    }
  }, [isPattern, composer, preset, usePresetPlayback]);

  return { play, stop, isReady: isPattern ? composer.isParsed() : true };
}
