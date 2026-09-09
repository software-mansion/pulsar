import type { LottieViewProps } from 'lottie-react-native';
import type { HapticConfig, HapticLottieProps, HapticMode, HapticSource } from '../types';

/** The native play/stop pair of a preset whose audio the view should let it play itself. */
export interface PresetPlayback {
  play: () => void;
  stop: () => void;
}

/**
 * `HapticLottieProps` with `source` and `hapticMode` decided, so the engines never
 * re-check the preset.
 */
export type ResolvedProps = Omit<LottieViewProps, 'source'> &
  HapticConfig & {
    source: LottieViewProps['source'];
    hapticMode: HapticMode;
    /** Set when the preset itself should play, so its synced audio plays with the haptics. */
    presetPlayback?: PresetPlayback;
  };

const warned = new Set<string>();

function warnOnce(key: string, message: string): void {
  if (warned.has(key)) {
    return;
  }
  warned.add(key);
  console.warn(`[react-native-pulsar-lottie] ${message}`);
}

/**
 * The mode a preset defaults to. A preset that was authored with audio only sounds
 * in `pattern` mode — realtime sampling drives the vibrator per frame and has no
 * audio track to follow — so an audio preset starts there unless asked otherwise.
 */
function defaultMode(preset: HapticConfig['preset']): HapticMode {
  return preset?.hasAudio ? 'pattern' : 'realtime';
}

/** Folds a `preset` into the props. Explicit props win. `null` means there is nothing to render. */
export function resolvePreset(props: HapticLottieProps): ResolvedProps | null {
  const { preset } = props;
  if (!preset) {
    // The prop union guarantees `source` without a preset.
    return { ...props, hapticMode: props.hapticMode ?? 'realtime' } as ResolvedProps;
  }

  const source = props.source ?? (preset.animation?.source as LottieViewProps['source']);
  if (!source) {
    warnOnce(
      preset.id,
      preset.hasAnimation
        ? `preset "${preset.id}" has an animation, but it is not carried in JS — it is either a ` +
            'dotLottie. Pass "source" explicitly.'
        : `preset "${preset.id}" has no animation. Pass "source" explicitly, or use a preset ` +
            'that was authored with one.'
    );
    return null;
  }

  // `preset.play` is the fallback when the pattern lives natively: a trigger, fired once at start.
  const haptics: HapticSource | undefined = props.haptics ?? preset.pattern ?? preset.play;

  // An audio preset the caller did not override plays through its own handle, so the native
  // engine drives the haptics and the synced audio together. The handle itself is passed
  // through, so its identity stays stable across re-renders.
  const presetPlayback = props.haptics === undefined && preset.hasAudio ? preset : undefined;

  return {
    ...props,
    source,
    haptics,
    presetPlayback,
    hapticMode: props.hapticMode ?? defaultMode(preset),
    durationMs: props.durationMs ?? preset.duration,
  } as ResolvedProps;
}
