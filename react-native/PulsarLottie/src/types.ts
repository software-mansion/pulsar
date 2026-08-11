import type { LottieViewProps } from 'lottie-react-native';
import type { Pattern } from 'react-native-pulsar';

/**
 * How the haptics are produced while the animation plays.
 *
 * - `realtime` (default): the animation timeline is the master clock and the
 *   pattern is sampled every frame into `RealtimeComposer` events. Honours
 *   pause / seek / loop coherently. Requires a `Pattern` source.
 * - `pattern`: a whole pattern (or a preset) is played once via
 *   `PatternComposer`, aligned to the animation start (best native fidelity).
 *   Seek / pause on the haptic side are best-effort — see the README.
 */
export type HapticMode = 'realtime' | 'pattern';

/**
 * The haptic content to play with the animation.
 *
 * - A {@link Pattern} — works in both modes.
 * - A preset trigger function, e.g. `Presets.heartbeat` — `pattern` mode only
 *   (fired once at the animation start).
 */
export type HapticSource = Pattern | (() => void);

/** Haptic-only additions layered on top of the native `LottieView` props. */
export interface HapticConfig {
  /** Haptic content to sync with the animation. Omit for a plain `LottieView`. */
  haptics?: HapticSource;
  /** Engine mode. Defaults to `realtime`. */
  hapticMode?: HapticMode;
  /** Device tuning: shift haptics by ±ms relative to the animation. Default 0. */
  hapticOffset?: number;
  /** Disable haptics without changing the animation. Default `true`. */
  hapticsEnabled?: boolean;
  /**
   * Total animation length in ms (`realtime` mode). Optional — derived from the
   * Lottie JSON source (`fr`/`ip`/`op`) when the source is an object, else from
   * the pattern's last event. Provide it when neither is available.
   */
  durationMs?: number;
}

/**
 * Props for {@link HapticLottieView}: a strict superset of the native
 * `LottieView` props plus {@link HapticConfig}. With `haptics` omitted the
 * component behaves exactly like `LottieView`.
 */
export type HapticLottieProps = LottieViewProps & HapticConfig;

/**
 * Imperative handle. Mirrors `LottieView`'s transport (`play`/`pause`/
 * `resume`/`reset`) and adds `stop()` and `setTimestamp(ms)`. In `realtime`
 * mode these steer the shared master clock, so animation and haptics move
 * together.
 */
export interface HapticLottieRef {
  /** Play from the start, or a frame segment (mirrors `LottieView.play`). */
  play: (startFrame?: number, endFrame?: number) => void;
  /** Pause both animation and haptics. */
  pause: () => void;
  /** Resume from the current position. */
  resume: () => void;
  /** Stop and rewind to the start. */
  stop: () => void;
  /** Rewind to the start (alias of LottieView.reset; also stops haptics). */
  reset: () => void;
  /** Seek both animation and haptics to `ms` from the start. */
  setTimestamp: (ms: number) => void;
}
