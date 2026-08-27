import type { LottieViewProps } from 'lottie-react-native';
import type { HapticConfig, HapticLottieProps, HapticSource } from '../types';

/** `HapticLottieProps` with `source` decided, so the engines never re-check the preset. */
export type ResolvedProps = Omit<LottieViewProps, 'source'> &
  HapticConfig & { source: LottieViewProps['source'] };

const warned = new Set<string>();

function warnOnce(key: string, message: string): void {
  if (warned.has(key)) {
    return;
  }
  warned.add(key);
  console.warn(`[react-native-pulsar-lottie] ${message}`);
}

/** Folds a `preset` into the props. Explicit props win. `null` means there is nothing to render. */
export function resolvePreset(props: HapticLottieProps): ResolvedProps | null {
  const { preset } = props;
  if (!preset) {
    return props as ResolvedProps; // the prop union guarantees `source` without a preset
  }

  const source = props.source ?? (preset.animation?.source as LottieViewProps['source']);
  if (!source) {
    warnOnce(
      preset.id,
      preset.hasAnimation
        ? `preset "${preset.id}" has an animation, but it is not carried in JS — it is either a ` +
            'dotLottie or came from loadBundle(). Pass "source" explicitly.'
        : `preset "${preset.id}" has no animation. Pass "source" explicitly, or use a preset ` +
            'that was authored with one.'
    );
    return null;
  }

  // `preset.play` is the fallback when the pattern lives natively: a trigger, fired once at start.
  const haptics: HapticSource | undefined = props.haptics ?? preset.pattern ?? preset.play;

  return {
    ...props,
    source,
    haptics,
    durationMs: props.durationMs ?? preset.duration,
  } as ResolvedProps;
}
