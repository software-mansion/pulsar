import { ScrollView, StyleSheet, View } from 'react-native';
import { Pattern, usePatternComposer } from 'react-native-pulsar';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useAnimatedReaction,
  Easing,
  SharedValue,
} from 'react-native-reanimated';
import { useEffect } from 'react';

import BasicLayout from '@/components/BasicLayout';
import { ThemedText } from '@/components/themed-text';
import { Margins } from '@/constants/theme';

const DOT_SIZE = 12;
const WAVE_HEIGHT = 30; // How high/low the dots move
const ANIMATION_DURATION = 1200; // ms for one complete wave cycle
const DOT_SPACING = 20; // Space between dots

// Haptic patterns for each dot
const dotPattern1: Pattern = {
  discretePattern: [
    { time: 0, amplitude: 0.8, frequency: 0.9 },
    { time: 40, amplitude: 0, frequency: 0.9 },
  ],
  continuousPattern: { amplitude: [], frequency: [] },
};

const dotPattern2: Pattern = {
  discretePattern: [
    { time: 0, amplitude: 0.6, frequency: 0.6 },
    { time: 50, amplitude: 0, frequency: 0.6 },
  ],
  continuousPattern: { amplitude: [], frequency: [] },
};

const dotPattern3: Pattern = {
  discretePattern: [
    { time: 0, amplitude: 0.7, frequency: 0.8 },
    { time: 45, amplitude: 0, frequency: 0.8 },
  ],
  continuousPattern: { amplitude: [], frequency: [] },
};

const LoaderDot = ({ progress, phaseOffset, pattern }: { progress: SharedValue<number>; phaseOffset: number; pattern: Pattern }) => {
  const { parse, play } = usePatternComposer();
  const lastTriggerTime = useSharedValue(0);

  useEffect(() => {
    parse(pattern);
  }, []);

  // Trigger haptic when dot reaches peak of wave
  useAnimatedReaction(
    () => progress.value,
    (current) => {
      const phase = (current + phaseOffset) % 1;
      
      // Trigger haptic when this dot reaches the top of the wave (around 0.25 of its cycle)
      // and debounce to trigger only once per wave
      if (phase > 0.2 && phase < 0.3 && Date.now() - lastTriggerTime.value > 400) {
        lastTriggerTime.value = Date.now();
        play();
      }
    }
  );

  const animatedStyle = useAnimatedStyle(() => {
    const phase = (progress.value + phaseOffset) % 1;
    // Create a sine wave: start at 0, go up (positive), back to 0, go down (negative), back to 0
    const waveY = Math.sin(phase * Math.PI * 2) * WAVE_HEIGHT;

    return {
      transform: [{ translateY: waveY }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.dot,
        animatedStyle,
      ]}
    />
  );
};

export default function DotLoaderDemo() {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: ANIMATION_DURATION,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <BasicLayout>
        <ThemedText type="title" style={Margins.marginTop4X}>
          Wavy Dot Loader
        </ThemedText>
        <ThemedText style={Margins.marginTop2X}>
          Watch the three dots move in a wave pattern and feel the haptics feedback at the peak of each wave.
        </ThemedText>

        <View style={styles.loaderContainer}>
          <View style={styles.dotsRow}>
            {/* Three dots in a row with wave animation */}
            <LoaderDot progress={progress} phaseOffset={0} pattern={dotPattern1} />
            <View style={styles.spacer} />
            <LoaderDot progress={progress} phaseOffset={-0.33} pattern={dotPattern2} />
            <View style={styles.spacer} />
            <LoaderDot progress={progress} phaseOffset={-0.66} pattern={dotPattern3} />
          </View>
        </View>

        <View style={styles.infoSection}>
          <ThemedText style={styles.infoText}>
            Each dot follows a wave pattern with a phase offset, creating a smooth wave motion. Haptic feedback is triggered at the peak of each dot's wave, enhancing the visual motion with tactile feedback.
          </ThemedText>
        </View>
      </BasicLayout>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 28,
  },
  loaderContainer: {
    marginTop: 60,
    marginBottom: 60,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: {
    width: DOT_SPACING,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: '#001A72',
  },
  infoSection: {
    marginTop: 40,
    paddingHorizontal: 16,
  },
  infoText: {
    lineHeight: 22,
    color: '#666',
  },
});
