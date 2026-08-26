import type { LottieViewProps } from 'lottie-react-native';
import type { HapticConfig, HapticLottieProps, HapticSource } from '../types';

/**
 * `HapticLottieProps` after a `preset` has been folded in: `source` is decided, so the engines can
 * read it without re-checking the preset.
 */
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

/**
 * Fold a bundle `preset` into the props: its Lottie becomes `source`, its pattern becomes
 * `haptics`, its authored length becomes `durationMs`. Anything passed explicitly wins.
 *
 * Returns `null` when there is nothing to render — a preset whose animation is not carried in JS
 * and no `source` to fall back on.
 */
export function resolvePreset(props: HapticLottieProps): ResolvedProps | null {
  const { preset } = props;
  if (!preset) {
    // Without a preset the prop union guarantees `source`.
    return props as ResolvedProps;
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

  // The pattern drives both engines. A preset from the binary path has none (it lives natively),
  // so fall back to its own trigger, which `pattern` mode fires once at the animation start.
  const haptics: HapticSource | undefined = props.haptics ?? preset.pattern ?? preset.play;

  return {
    ...props,
    source,
    haptics,
    durationMs: props.durationMs ?? preset.duration,
  } as ResolvedProps;
}
