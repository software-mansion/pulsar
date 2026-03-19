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
const CHARGE_TO_POP_MS = 950;
const RELEASE_RESET_MS = 180;
const POP_FADE_MS = 120;
const COOLDOWN_MS = 1000;

function BalloonCell(_: { index: number }) {
  const composer = useRealtimeComposer();

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

  useAnimatedReaction(
    () => progress.value,
    (current, previous) => {
      'worklet';
      const prev = previous ?? 0;

      if (current >= 1 && prev < 1) {
        composer.stop();
        composer.playDiscrete(1.0, 1.0);
        runOnJS(handlePop)();
        return;
      }

      // Drive continuous haptic with increasing amplitude and frequency as balloon pumps
      if (current > 0 && current < 1) {
        const amplitude = interpolate(current, [0, 0.75, 1], [0.06, 0.3, 0.55], Extrapolation.CLAMP);
        const frequency = interpolate(current, [0, 1], [0.15, 0.8], Extrapolation.CLAMP);
        composer.set(amplitude, frequency);
      }

      // Start/stop shake animation at 0.75
      if (current >= 0.75 && prev < 0.75) {
        shakeOffset.value = withRepeat(
          withSequence(withTiming(5, { duration: 40 }), withTiming(-5, { duration: 40 })),
          -1,
          true,
        );
      } else if (current < 0.75 && prev >= 0.75) {
        cancelAnimation(shakeOffset);
        shakeOffset.value = withTiming(0, { duration: 50 });
      }

      // Discrete impulses escalating through the shake zone
      if ((prev < 0.80 && current >= 0.80) || (prev < 0.88 && current >= 0.88) || (prev < 0.94 && current >= 0.94)) {
        const shakeProg = interpolate(current, [0.75, 1], [0, 1], Extrapolation.CLAMP);
        composer.playDiscrete(0.45 + shakeProg * 0.35, 0.65 + shakeProg * 0.25);
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
      duration: CHARGE_TO_POP_MS,
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
