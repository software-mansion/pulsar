import { ScrollView, StyleSheet, View } from 'react-native';
import { Pattern, usePatternComposer } from 'react-native-pulsar';

import BasicLayout from '@/components/BasicLayout';
import { ThemedText } from '@/components/themed-text';
import { Margins } from '@/constants/theme';
import HapticDemoButton from '@/components/demo/HapticDemoButton';

export default function ButtonsDemo() {
  const tapPattern: Pattern = {
    discretePattern: [
      { time: 0, amplitude: 1.0, frequency: 1.0 },
    ],
    continuousPattern: { amplitude: [], frequency: [] },
  };

  const softPattern: Pattern = {
    discretePattern: [
      { time: 0, amplitude: 0.4, frequency: 0.7 },
    ],
    continuousPattern: { amplitude: [], frequency: [] },
  };

  const deepPattern: Pattern = {
    discretePattern: [
      { time: 0, amplitude: 0.9, frequency: 0.1 },
    ],
    continuousPattern: { amplitude: [], frequency: [] },
  };

  const doublePattern: Pattern = {
    discretePattern: [
      { time: 0, amplitude: 0.9, frequency: 0.8 },
      { time: 60, amplitude: 0.9, frequency: 0.8 },
    ],
    continuousPattern: { amplitude: [], frequency: [] },
  };

  const knockPattern: Pattern = {
    discretePattern: [
      { time: 0, amplitude: 1.0, frequency: 0.3 },
      { time: 180, amplitude: 0.8, frequency: 0.25 },
    ],
    continuousPattern: { amplitude: [], frequency: [] },
  };

  const ripplePattern: Pattern = {
    discretePattern: [
      { time: 0, amplitude: 1.0, frequency: 0.7 },
      { time: 70, amplitude: 0.7, frequency: 0.55 },
      { time: 140, amplitude: 0.45, frequency: 0.45 },
      { time: 210, amplitude: 0.25, frequency: 0.35 },
    ],
    continuousPattern: { amplitude: [], frequency: [] },
  };

  const tapComposer = usePatternComposer(tapPattern);
  const softComposer = usePatternComposer(softPattern);
  const deepComposer = usePatternComposer(deepPattern);
  const doubleComposer = usePatternComposer(doublePattern);
  const knockComposer = usePatternComposer(knockPattern);
  const rippleComposer = usePatternComposer(ripplePattern);

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
