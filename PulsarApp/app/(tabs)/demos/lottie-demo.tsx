import { useRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { HapticLottieView, type HapticLottieRef } from 'react-native-pulsar-lottie';
import type { Pattern } from 'react-native-pulsar';

import BasicLayout from '@/components/BasicLayout';
import { ThemedText } from '@/components/themed-text';
import { Margins } from '@/constants/theme';
import HapticDemoButton from '@/components/demo/HapticDemoButton';

// A haptic pattern spanning the ~2.4s "verified" animation. In the default
// `realtime` mode the animation timeline is the master clock, so the haptics
// follow play / pause / replay and land with the check: a gentle swell that
// resolves into a firm confirming tap as the checkmark snaps in.
const verifiedPattern: Pattern = {
  discretePattern: [
    { time: 100, amplitude: 0.35, frequency: 0.55 },
    { time: 1500, amplitude: 0.6, frequency: 0.7 },
    { time: 1850, amplitude: 1, frequency: 0.9 },
    { time: 2050, amplitude: 0.45, frequency: 0.6 },
  ],
  continuousPattern: {
    amplitude: [
      { time: 0, value: 0 },
      { time: 300, value: 0.25 },
      { time: 900, value: 0.45 },
      { time: 1500, value: 0.65 },
      { time: 1850, value: 0.9 },
      { time: 2000, value: 0.15 },
      { time: 2436, value: 0 },
    ],
    frequency: [
      { time: 0, value: 0.35 },
      { time: 900, value: 0.5 },
      { time: 1850, value: 0.9 },
      { time: 2436, value: 0.55 },
    ],
  },
};

export default function LottieDemo() {
  const ref = useRef<HapticLottieRef>(null);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <BasicLayout>
        <ThemedText type="title" style={Margins.marginTop4X}>
          Lottie + haptics
        </ThemedText>
        <ThemedText style={Margins.marginTop2X}>
          A drop-in replacement for LottieView that plays a haptic pattern in
          lockstep with the animation timeline. Best felt on a real device.
        </ThemedText>

        <View style={styles.canvas}>
          <HapticLottieView
            ref={ref}
            source={require('@/assets/animations/verified.json')}
            haptics={verifiedPattern}
            hapticMode="realtime"
            autoPlay
            loop={false}
            style={styles.lottie}
          />
        </View>

        <View style={styles.controls}>
          <HapticDemoButton
            label="▶ Replay"
            onPress={() => ref.current?.play()}
            style={styles.button}
          />
          <HapticDemoButton
            label="■ Stop"
            onPress={() => ref.current?.stop()}
            style={styles.button}
          />
        </View>

        <ThemedText style={Margins.marginTop4X}>
          The timeline drives the haptics, so pausing or replaying the animation
          keeps them in sync automatically.
        </ThemedText>
      </BasicLayout>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 28,
  },
  canvas: {
    marginTop: 22,
    height: 220,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#38ACDD',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  lottie: {
    width: 180,
    height: 180,
  },
  controls: {
    marginTop: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    columnGap: 16,
  },
  button: {
    flex: 1,
  },
});
