import type { LottieViewProps } from 'lottie-react-native';
import type { PresetHandle } from 'react-native-pulsar';
import type { HapticConfig, HapticLottieProps, HapticMode, HapticSource } from '../types';

/**
 * `HapticLottieProps` with `source` and `hapticMode` decided, so the engines never
 * re-check the preset.
 */
export type ResolvedProps = Omit<LottieViewProps, 'source'> &
  HapticConfig & {
    source: LottieViewProps['source'];
    hapticMode: HapticMode;
    /** The preset to play through its own native handle, so its audio plays with the haptics. */
    audioPreset?: PresetHandle;
  };

const warned = new Set<string>();

function warnOnce(key: string, message: string): void {
  if (warned.has(key)) {
    return;
  }
  warned.add(key);
  console.warn(`[react-native-pulsar-lottie] ${message}`);
}

/** A preset's audio only sounds when the preset itself plays, which only `pattern` mode does. */
function playsOwnAudio(props: HapticLottieProps, preset: PresetHandle): boolean {
  return props.haptics === undefined && preset.hasAudio;
}

/** Folds a `preset` into the props. Explicit props win. `null` means there is nothing to render. */
export function resolvePreset(props: HapticLottieProps): ResolvedProps | null {
  const { preset } = props;
  if (!preset) {
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
  const playsAudio = playsOwnAudio(props, preset);

  return {
    ...props,
    source,
    haptics,
    audioPreset: playsAudio ? preset : undefined,
    hapticMode: props.hapticMode ?? (playsAudio ? 'pattern' : 'realtime'),
    durationMs: props.durationMs ?? preset.duration,
  } as ResolvedProps;
}
