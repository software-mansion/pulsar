import { ScrollView, StyleSheet, View } from 'react-native';
import { Pattern, useHapticsComposer } from 'react-native-pulsar';

import BasicLayout from '@/components/BasicLayout';
import { ThemedText } from '@/components/themed-text';
import { Margins } from '@/constants/theme';
import HapticDemoButton from '@/components/demo/HapticDemoButton';

export default function ButtonsDemo() {
  const tapPattern: Pattern = {
    discretePattern: [
      { time: 0, amplitude: 1, frequency: 0.9 },
      { time: 35, amplitude: 0, frequency: 0.9 },
    ],
    continuousPattern: { amplitude: [], frequency: [] },
  };

  const softPattern: Pattern = {
    discretePattern: [
      { time: 0, amplitude: 0.55, frequency: 0.45 },
      { time: 60, amplitude: 0, frequency: 0.45 },
    ],
    continuousPattern: { amplitude: [], frequency: [] },
  };

  const deepPattern: Pattern = {
    discretePattern: [
      { time: 0, amplitude: 0.8, frequency: 0.2 },
      { time: 80, amplitude: 0, frequency: 0.2 },
    ],
    continuousPattern: { amplitude: [], frequency: [] },
  };

  const doublePattern: Pattern = {
    discretePattern: [
      { time: 0, amplitude: 0.85, frequency: 0.75 },
      { time: 45, amplitude: 0, frequency: 0.75 },
      { time: 95, amplitude: 0.85, frequency: 0.75 },
      { time: 135, amplitude: 0, frequency: 0.75 },
    ],
    continuousPattern: { amplitude: [], frequency: [] },
  };

  const knockPattern: Pattern = {
    discretePattern: [
      { time: 0, amplitude: 0.9, frequency: 0.35 },
      { time: 90, amplitude: 0, frequency: 0.35 },
    ],
    continuousPattern: { amplitude: [], frequency: [] },
  };

  const ripplePattern: Pattern = {
    discretePattern: [
      { time: 0, amplitude: 0.3, frequency: 0.9 },
      { time: 35, amplitude: 0, frequency: 0.9 },
      { time: 70, amplitude: 0.6, frequency: 0.6 },
      { time: 110, amplitude: 0, frequency: 0.6 },
      { time: 145, amplitude: 0.9, frequency: 0.35 },
      { time: 195, amplitude: 0, frequency: 0.35 },
    ],
    continuousPattern: { amplitude: [], frequency: [] },
  };

  const tapComposer = useHapticsComposer(tapPattern);
  const softComposer = useHapticsComposer(softPattern);
  const deepComposer = useHapticsComposer(deepPattern);
  const doubleComposer = useHapticsComposer(doublePattern);
  const knockComposer = useHapticsComposer(knockPattern);
  const rippleComposer = useHapticsComposer(ripplePattern);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <BasicLayout>
        <ThemedText type="title" style={Margins.marginTop4X}>
          Buttons haptics grid
        </ThemedText>
        <ThemedText style={Margins.marginTop2X}>
          Tap each button to feel a different haptic pattern.
        </ThemedText>

        <View style={styles.grid}>
          <HapticDemoButton label="Tap" onPress={() => tapComposer.play()} style={styles.gridButton} />
          <HapticDemoButton label="Soft" onPress={() => softComposer.play()} style={styles.gridButton} />
          <HapticDemoButton label="Deep" onPress={() => deepComposer.play()} style={styles.gridButton} />
          <HapticDemoButton label="Double" onPress={() => doubleComposer.play()} style={styles.gridButton} />
          <HapticDemoButton label="Knock" onPress={() => knockComposer.play()} style={styles.gridButton} />
          <HapticDemoButton label="Ripple" onPress={() => rippleComposer.play()} style={styles.gridButton} />
        </View>
      </BasicLayout>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  grid: {
    marginTop: 22,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 20,
  },
  gridButton: {
    width: '48%',
  },
});
