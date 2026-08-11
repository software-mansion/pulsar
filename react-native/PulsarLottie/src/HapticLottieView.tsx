import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import LottieView from 'lottie-react-native';
import Animated, {
  useAnimatedProps,
  useFrameCallback,
  useSharedValue,
} from 'react-native-reanimated';
import { usePatternComposer, useRealtimeComposer } from 'react-native-pulsar';
import type { Pattern } from 'react-native-pulsar';
import type { HapticLottieProps, HapticLottieRef } from './types';
import {
  clamp,
  lottieDurationMs,
  patternDurationMs,
  sampleEnvelope,
} from './internal/sampler';

const AnimatedLottieView = Animated.createAnimatedComponent(LottieView);

/**
 * `realtime` engine: the animation timeline is the master clock. A Reanimated
 * frame callback advances the playhead, drives the Lottie `progress` on the UI
 * thread (no re-renders), and samples the pattern into `RealtimeComposer`
 * events. Honours pause / seek / loop coherently.
 */
const RealtimeHapticLottie = forwardRef<HapticLottieRef, HapticLottieProps>(
  function RealtimeHapticLottie(props, ref) {
    const {
      haptics,
      hapticMode: _hapticMode,
      hapticOffset = 0,
      hapticsEnabled = true,
      durationMs,
      source,
      autoPlay,
      loop,
      progress: _progress,
      ...rest
    } = props;

    const pattern = haptics as Pattern;
    const realtime = useRealtimeComposer();

    const amp = pattern.continuousPattern.amplitude;
    const freq = pattern.continuousPattern.frequency;
    const discrete = pattern.discretePattern;
    const hasContinuous = amp.length > 0 && freq.length > 0;
    const doLoop = loop ?? false;

    const durMs = useMemo(() => {
      if (durationMs && durationMs > 0) {
        return durationMs;
      }
      const fromSource = lottieDurationMs(source);
      if (fromSource) {
        return fromSource;
      }
      return patternDurationMs(pattern);
    }, [durationMs, source, pattern]);

    const timeMs = useSharedValue(0);
    const progressSV = useSharedValue(0);
    const playing = useSharedValue(false);
    const lastT = useSharedValue(0);

    const frame = useFrameCallback((info) => {
      'worklet';
      if (!playing.value) {
        return;
      }
      const dt = info.timeSincePreviousFrame ?? 0;
      let t = timeMs.value + dt;
      let ended = false;
      if (durMs > 0 && t >= durMs) {
        if (doLoop) {
          t = t % durMs;
          lastT.value = 0;
        } else {
          t = durMs;
          playing.value = false;
          ended = true;
        }
      }
      timeMs.value = t;
      progressSV.value = durMs > 0 ? t / durMs : 0;

      if (hapticsEnabled) {
        const ht = t + hapticOffset;
        if (hasContinuous) {
          realtime.set(
            clamp(sampleEnvelope(amp, ht), 0, 1),
            clamp(sampleEnvelope(freq, ht), 0, 1)
          );
        }
        const prev = lastT.value;
        for (let i = 0; i < discrete.length; i++) {
          const e = discrete[i]!;
          if (e.time > prev && e.time <= t) {
            realtime.playDiscrete(clamp(e.amplitude, 0, 1), clamp(e.frequency, 0, 1));
          }
        }
      }
      lastT.value = t;

      if (ended && hapticsEnabled && hasContinuous) {
        realtime.stop();
      }
    }, false);

    const rewind = useCallback(() => {
      timeMs.value = 0;
      lastT.value = 0;
      progressSV.value = 0;
    }, [timeMs, lastT, progressSV]);

    useImperativeHandle(
      ref,
      () => ({
        play: () => {
          rewind();
          playing.value = true;
          frame.setActive(true);
        },
        pause: () => {
          playing.value = false;
          if (hapticsEnabled && hasContinuous) {
            realtime.stop();
          }
        },
        resume: () => {
          playing.value = true;
          frame.setActive(true);
        },
        stop: () => {
          playing.value = false;
          rewind();
          if (hapticsEnabled) {
            realtime.stop();
          }
          frame.setActive(false);
        },
        reset: () => {
          playing.value = false;
          rewind();
          if (hapticsEnabled) {
            realtime.stop();
          }
        },
        setTimestamp: (ms: number) => {
          const t = clamp(ms, 0, durMs);
          timeMs.value = t;
          lastT.value = t;
          progressSV.value = durMs > 0 ? t / durMs : 0;
        },
      }),
      [rewind, frame, playing, timeMs, lastT, progressSV, realtime, durMs, hapticsEnabled, hasContinuous]
    );

    useEffect(() => {
      if (autoPlay) {
        rewind();
        playing.value = true;
        frame.setActive(true);
      }
      // Run once on mount; autoPlay is an initial-state flag, not a live toggle.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const animatedProps = useAnimatedProps(() => ({ progress: progressSV.value }));

    return (
      <AnimatedLottieView
        {...rest}
        source={source}
        autoPlay={false}
        loop={false}
        animatedProps={animatedProps}
      />
    );
  }
);

/**
 * `pattern` engine (also the no-haptics fallback): the animation plays itself
 * and a pre-parsed pattern (or preset) is fired once, aligned to the start.
 * Best native fidelity; seek/pause on the haptic side are best-effort.
 */
const PatternHapticLottie = forwardRef<HapticLottieRef, HapticLottieProps>(
  function PatternHapticLottie(props, ref) {
    const {
      haptics,
      hapticMode: _hapticMode,
      hapticOffset: _hapticOffset,
      hapticsEnabled = true,
      durationMs: _durationMs,
      source,
      autoPlay,
      loop,
      onAnimationLoaded,
      ...rest
    } = props;

    const lottieRef = useRef<LottieView>(null);
    const isPattern = typeof haptics === 'object' && haptics !== null;
    const composer = usePatternComposer(isPattern ? (haptics as Pattern) : undefined);

    const fireHaptics = useCallback(() => {
      if (!hapticsEnabled || !haptics) {
        return;
      }
      if (typeof haptics === 'function') {
        haptics();
      } else if (composer.isParsed()) {
        composer.play();
      }
    }, [haptics, hapticsEnabled, composer]);

    const stopHaptics = useCallback(() => {
      if (isPattern) {
        composer.stop();
      }
    }, [isPattern, composer]);

    useImperativeHandle(
      ref,
      () => ({
        play: (startFrame?: number, endFrame?: number) => {
          if (startFrame != null && endFrame != null) {
            lottieRef.current?.play(startFrame, endFrame);
          } else {
            lottieRef.current?.play();
          }
          fireHaptics();
        },
        pause: () => {
          lottieRef.current?.pause();
          stopHaptics();
        },
        resume: () => {
          lottieRef.current?.resume();
        },
        stop: () => {
          lottieRef.current?.reset();
          stopHaptics();
        },
        reset: () => {
          lottieRef.current?.reset();
          stopHaptics();
        },
        setTimestamp: (_ms: number) => {
          // lottie-react-native exposes no imperative seek; pattern mode cannot
          // reposition a buffered haptic. See the README for the trade-off.
        },
      }),
      [fireHaptics, stopHaptics]
    );

    return (
      <LottieView
        ref={lottieRef}
        {...rest}
        source={source}
        loop={loop}
        autoPlay={false}
        onAnimationLoaded={() => {
          if (autoPlay) {
            lottieRef.current?.play();
            fireHaptics();
          }
          onAnimationLoaded?.();
        }}
      />
    );
  }
);

/**
 * A drop-in superset of `lottie-react-native`'s `LottieView`. Pass the same
 * props you already use; add `haptics` (and optionally `hapticMode`,
 * `hapticOffset`, `hapticsEnabled`) to play Pulsar haptics in sync. With
 * `haptics` omitted it behaves exactly like `LottieView`.
 */
export const HapticLottieView = forwardRef<HapticLottieRef, HapticLottieProps>(
  function HapticLottieView(props, ref) {
    const mode = props.hapticMode ?? 'realtime';
    const isPattern = typeof props.haptics === 'object' && props.haptics !== null;
    if (mode !== 'pattern' && isPattern) {
      return <RealtimeHapticLottie ref={ref} {...props} />;
    }
    return <PatternHapticLottie ref={ref} {...props} />;
  }
);
