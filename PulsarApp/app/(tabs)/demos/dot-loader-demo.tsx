import { ScrollView, StyleSheet, View } from 'react-native';
import { Pattern, usePatternComposer } from 'react-native-pulsar';
import Animated from 'react-native-reanimated';
import { useEffect } from 'react';

import BasicLayout from '@/components/BasicLayout';
import { ThemedText } from '@/components/themed-text';
import { Margins } from '@/constants/theme';

const DOT_SIZE = 12;
const WAVE_HEIGHT = 30;
const CYCLE_DURATION = 3000; // ms for one full cycle (wave + long rest pause)
const DOT_INTERVAL = 220;    // ms between each dot starting its wave
const DOT_SPACING = 20;
const BOTTOM_HIT_RATIO = 0.14; // 14% into cycle = bottom (420ms — snappy drop)

// CSS keyframes: snappy drop to bottom (0-14%), bounce back (14-28%), long rest (28-100%)
const waveKeyframes = {
  '0%':   { transform: [{ translateY: 0 }] },
  '14%':  { transform: [{ translateY: -WAVE_HEIGHT }] },
  '28%':  { transform: [{ translateY: 0 }] },
  '100%': { transform: [{ translateY: 0 }] },
};

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

const patterns = [dotPattern1, dotPattern2, dotPattern3];

const LoaderDot = ({ dotIndex, pattern }: { dotIndex: number; pattern: Pattern }) => {
  const { parse, play } = usePatternComposer();

  useEffect(() => {
    parse(pattern);

    // Fire haptics each time this dot hits the bottom line
    const firstHit = dotIndex * DOT_INTERVAL + CYCLE_DURATION * BOTTOM_HIT_RATIO;
    let intervalId: ReturnType<typeof setInterval>;

    const timeoutId = setTimeout(() => {
      play();
      intervalId = setInterval(() => play(), CYCLE_DURATION);
    }, firstHit);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          animationName: waveKeyframes,
          animationDuration: `${CYCLE_DURATION}ms`,
          animationDelay: `${dotIndex * DOT_INTERVAL}ms`,
          animationIterationCount: 'infinite',
          animationTimingFunction: 'ease-in-out',
        },
      ]}
    />
  );
};

export default function DotLoaderDemo() {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <BasicLayout>
        <ThemedText type="title" style={Margins.marginTop4X}>
          Wavy Dot Loader
        </ThemedText>
        <ThemedText style={Margins.marginTop2X}>
          Watch the three dots move in a wave pattern and feel the haptic feedback each time a dot hits the bottom.
        </ThemedText>

        <View style={styles.loaderContainer}>
          <View style={styles.dotsRow}>
            {patterns.map((pattern, index) => (
              <View key={index} style={styles.dotWrapper}>
                <LoaderDot dotIndex={index} pattern={pattern} />
              </View>
            ))}
          </View>
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
  dotWrapper: {
    marginHorizontal: DOT_SPACING / 2,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: '#001A72',
  },
});
