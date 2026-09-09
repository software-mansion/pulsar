import { useCallback } from 'react';
import { usePatternComposer } from 'react-native-pulsar';
import type { PresetHandle } from 'react-native-pulsar';
import type { HapticSource } from './types';

export interface UseHapticLottieOptions {
  /** Bundle preset to fire: its pattern, plus its synced audio when it has any. */
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
  const audioPreset =
    options.haptics === undefined && preset?.hasAudio ? preset : undefined;
  const composedPattern =
    !audioPreset && typeof haptics === 'object' && haptics !== null ? haptics : undefined;
  const composer = usePatternComposer(composedPattern);

  const play = useCallback(() => {
    if (!hapticsEnabled) {
      return;
    }
    if (audioPreset) {
      audioPreset.play();
    } else if (typeof haptics === 'function') {
      haptics();
    } else if (composedPattern && composer.isParsed()) {
      composer.play();
    }
  }, [haptics, hapticsEnabled, composer, composedPattern, audioPreset]);

  const stop = useCallback(() => {
    if (audioPreset) {
      audioPreset.stop();
    } else if (composedPattern) {
      composer.stop();
    }
  }, [composedPattern, composer, audioPreset]);

  return { play, stop, isReady: composedPattern ? composer.isParsed() : true };
}
