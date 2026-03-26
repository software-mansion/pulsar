import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRealtimeComposer } from 'react-native-pulsar';
import Animated, {
  Easing,
  Extrapolation,
  cancelAnimation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import BasicLayout from '@/components/BasicLayout';
import { ThemedText } from '@/components/themed-text';
import { Colors, Margins } from '@/constants/theme';

const BALLOON_COUNT = 4;
const RELEASE_RESET_MS = 180;
const POP_FADE_MS = 120;
const COOLDOWN_MS = 1000;

interface BalloonParams {
  chargeMs: number;
  // Inflation phase (0 → shakeThreshold): amplitude ramps up, frequency ramps down (air slows as resistance grows)
  ampMin: number;
  ampMid: number;
  freqHigh: number; // freq at start of inflation (rushing air)
  freqLow: number;  // freq at shakeThreshold (straining)
  // Shake phase (shakeThreshold → 1): discrete impulses synced to direction reversals
  ampMax: number;         // max impulse amplitude at progress=1
  shakeImpulseFreq: number; // impulse frequency character during shake
  shakeAmt: number;
  shakeDur: number;
  shakeThreshold: number;
}

const BALLOON_PARAMS: BalloonParams[] = [
  {
    // Balloon 0: balanced feel
    chargeMs: 950,
    ampMin: 0.05, ampMid: 0.28, ampMax: 0.75,
    freqHigh: 0.75, freqLow: 0.22,
    shakeImpulseFreq: 0.50,
    shakeAmt: 5, shakeDur: 40, shakeThreshold: 0.75,
  },
  {
    // Balloon 1: heavy & deep — slow, low-frequency thumps
    chargeMs: 1100,
    ampMin: 0.07, ampMid: 0.35, ampMax: 0.85,
    freqHigh: 0.50, freqLow: 0.10,
    shakeImpulseFreq: 0.18,
    shakeAmt: 8, shakeDur: 58, shakeThreshold: 0.72,
  },
  {
    // Balloon 2: light & crisp — quick, high-pitched taps
    chargeMs: 780,
    ampMin: 0.03, ampMid: 0.18, ampMax: 0.50,
    freqHigh: 0.95, freqLow: 0.40,
    shakeImpulseFreq: 0.82,
    shakeAmt: 4, shakeDur: 26, shakeThreshold: 0.78,
  },
  {
    // Balloon 3: erratic — mid energy, uneven rhythm from irregular shake
    chargeMs: 870,
    ampMin: 0.06, ampMid: 0.25, ampMax: 0.75,
    freqHigh: 0.68, freqLow: 0.18,
    shakeImpulseFreq: 0.42,
    shakeAmt: 6, shakeDur: 32, shakeThreshold: 0.73,
  },
];

function BalloonCell({ index }: { index: number }) {
  const composer = useRealtimeComposer();
  const params = BALLOON_PARAMS[index % BALLOON_PARAMS.length]!;

  const progress = useSharedValue(0);
  const balloonOpacity = useSharedValue(1);
  const poppedOpacity = useSharedValue(0);
  const shakeOffset = useSharedValue(0);
  const poppedRef = useRef(false);
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
      }
    };
  }, []);

  const handlePop = () => {
    if (poppedRef.current) {
      return;
    }

    poppedRef.current = true;

    cancelAnimation(shakeOffset);
    shakeOffset.value = withTiming(0, { duration: 50 });
    balloonOpacity.value = withTiming(0, { duration: POP_FADE_MS });
    poppedOpacity.value = withTiming(1, { duration: POP_FADE_MS });

    if (cooldownTimerRef.current) {
      clearTimeout(cooldownTimerRef.current);
    }

    cooldownTimerRef.current = setTimeout(() => {
      progress.value = 0;
      poppedOpacity.value = withTiming(0, { duration: 140 });
      balloonOpacity.value = withTiming(1, { duration: 220 });
      poppedRef.current = false;
    }, COOLDOWN_MS);
  };

  const { ampMin, ampMid, ampMax, freqHigh, freqLow, shakeImpulseFreq, shakeAmt, shakeDur, shakeThreshold } = params;

  useAnimatedReaction(
    () => progress.value,
    (current, previous) => {
      'worklet';
      const prev = previous ?? 0;

      // Pop
      if (current >= 1 && prev < 1) {
        composer.stop();
        composer.playDiscrete(1.0, 1.0);
        runOnJS(handlePop)();
        return;
      }

      // Release: balloon deflates — one soft puff
      if (current <= 0 && prev > 0.05) {
        composer.stop();
        composer.playDiscrete(0.18, freqLow);
        return;
      }

      // Inflation phase: amplitude builds, frequency drops (air slows as resistance grows)
      if (current > 0 && current < shakeThreshold) {
        const amplitude = interpolate(current, [0, shakeThreshold], [ampMin, ampMid], Extrapolation.CLAMP);
        const frequency = interpolate(current, [0, shakeThreshold], [freqHigh, freqLow], Extrapolation.CLAMP);
        composer.set(amplitude, frequency);
      }

      // Enter shake zone: stop continuous haptic, let shakeOffset drive impulses
      if (current >= shakeThreshold && prev < shakeThreshold) {
        shakeOffset.value = withRepeat(
          withSequence(withTiming(shakeAmt, { duration: shakeDur }), withTiming(-shakeAmt, { duration: shakeDur })),
          -1,
          true,
        );
      } else if (current < shakeThreshold && prev >= shakeThreshold) {
        cancelAnimation(shakeOffset);
        shakeOffset.value = withTiming(0, { duration: 50 });
      }
    },
    [],
  );

  // Shake-synced impulses: fire on each direction reversal (zero-crossing of shakeOffset)
  useAnimatedReaction(
    () => shakeOffset.value,
    (current, previous) => {
      'worklet';
      const prev = previous ?? 0;
      if (progress.value < shakeThreshold) return;

      const crossed = (prev > 0.5 && current < -0.5) || (prev < -0.5 && current > 0.5);
      if (crossed) {
        const prog = interpolate(progress.value, [shakeThreshold, 1], [0, 1], Extrapolation.CLAMP);
        composer.playDiscrete(ampMid + prog * (ampMax - ampMid), shakeImpulseFreq);
      }
    },
    [],
  );

  const balloonStyle = useAnimatedStyle(() => {
    const scale = interpolate(progress.value, [0, 1], [1, 1.4], Extrapolation.CLAMP);

    return {
      transform: [{ translateX: shakeOffset.value }, { scale }],
      opacity: balloonOpacity.value,
    };
  });

  const poppedStyle = useAnimatedStyle(() => ({
    opacity: poppedOpacity.value,
  }));

  const startCharge = () => {
    if (poppedRef.current) {
      return;
    }

    cancelAnimation(progress);
    progress.value = withTiming(1, {
      duration: params.chargeMs,
      easing: Easing.out(Easing.cubic),
    });
  };

  const stopCharge = () => {
    if (poppedRef.current) {
      return;
    }

    cancelAnimation(progress);
    progress.value = withTiming(0, {
      duration: RELEASE_RESET_MS,
      easing: Easing.out(Easing.quad),
    });
  };

  return (
    <Pressable style={styles.cell} delayLongPress={140} onLongPress={startCharge} onPressOut={stopCharge}>
      <View style={styles.dotSlot}>
        <Animated.View style={[styles.dot, balloonStyle]} />
        <Animated.View style={[styles.poppedDot, styles.poppedOverlay, poppedStyle]} />
      </View>
    </Pressable>
  );
}

export default function BalloonDemo() {
  return (
    <BasicLayout>
      <ThemedText type="title" style={Margins.marginTop4X}>
        Popping balloons
      </ThemedText>
      <ThemedText style={Margins.marginTop2X}>
        Long press each balloon to pump it up!
      </ThemedText>

      <View style={styles.grid}>
        {Array.from({ length: BALLOON_COUNT }).map((_, index) => (
          <BalloonCell key={`balloon-${index}`} index={index} />
        ))}
      </View>
    </BasicLayout>
  );
}

const styles = StyleSheet.create({
  helperText: {
    marginTop: 8,
  },
  grid: {
    marginTop: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  cell: {
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  dotSlot: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.tint,
  },
  poppedDot: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderStyle: 'dotted',
    borderColor: Colors.light.borderColor,
    opacity: 0.7,
  },
  poppedOverlay: {
    opacity: 0,
  },
  statusText: {
    marginTop: 10,
  },
});
