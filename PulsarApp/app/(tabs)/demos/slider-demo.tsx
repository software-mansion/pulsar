import { StyleSheet, ScrollView, View } from 'react-native';
import { useCallback } from 'react';
import { useHapticsComposer, Pattern } from 'react-native-pulsar';

import BasicLayout from '@/components/BasicLayout';
import { ThemedText } from '@/components/themed-text';
import { Margins } from '@/constants/theme';
import HapticSlider from '@/components/demo/HapticSlider';
import { useSharedValue } from 'react-native-reanimated';

const quickTickPattern: Pattern = {
  discretePattern: [
    { time: 0, amplitude: 1, frequency: 1 },
    { time: 40, amplitude: 0, frequency: 1 },
  ],
  continuousPattern: { amplitude: [], frequency: [] },
};

const softTickPattern: Pattern = {
  discretePattern: [
    { time: 0, amplitude: 0.6, frequency: 0.4 },
    { time: 60, amplitude: 0, frequency: 0.4 },
  ],
  continuousPattern: { amplitude: [], frequency: [] },
};

const deepTickPattern: Pattern = {
  discretePattern: [
    { time: 0, amplitude: 0.8, frequency: 0.2 },
    { time: 80, amplitude: 0, frequency: 0.2 },
  ],
  continuousPattern: { amplitude: [], frequency: [] },
};

export default function SliderDemo() {
  const value1 = useSharedValue(50);
  const value2 = useSharedValue(50);
  const value3 = useSharedValue(50);

  const quickTickComposer = useHapticsComposer(quickTickPattern);
  const softTickComposer = useHapticsComposer(softTickPattern);
  const deepTickComposer = useHapticsComposer(deepTickPattern);

  const handleSlider1Change = useCallback((newValue: number) => {
    'worklet';
    const oldTick = Math.floor(value1.value / 10);
    const newTick = Math.floor(newValue / 10);
    if (oldTick !== newTick) quickTickComposer.play();
    value1.value = newValue;
  }, [value1, quickTickComposer]);

  const handleSlider2Change = useCallback((newValue: number) => {
    'worklet';
    const oldTick = Math.floor(value2.value / 10);
    const newTick = Math.floor(newValue / 10);
    if (oldTick !== newTick) softTickComposer.play();
    value2.value = newValue;
  }, [value2, softTickComposer]);

  const handleSlider3Change = useCallback((newValue: number) => {
    'worklet';
    const oldTick = Math.floor(value3.value / 10);
    const newTick = Math.floor(newValue / 10);
    if (oldTick !== newTick) deepTickComposer.play();
    value3.value = newValue;
  }, [value3, deepTickComposer]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <BasicLayout>
        <ThemedText type="title" style={Margins.marginTop4X}>
          Slider haptics
        </ThemedText>
        <ThemedText style={Margins.marginTop2X}>
          Move each slider to feel different haptic characteristics. Each slider plays a unique haptic feedback when crossing ticks.
        </ThemedText>

        <View style={styles.sliderContainer}>
          <View style={styles.sliderCard}>
            <ThemedText type="subtitle" style={styles.sliderTitle}>
              Quick Tick
            </ThemedText>
            <HapticSlider
              value={50}
              onValueChange={handleSlider1Change}
              style={styles.slider}
            />
          </View>

          <View style={styles.sliderCard}>
            <ThemedText type="subtitle" style={styles.sliderTitle}>
              Soft Tick
            </ThemedText>
            <HapticSlider
              value={50}
              onValueChange={handleSlider2Change}
              style={styles.slider}
            />
          </View>

          <View style={styles.sliderCard}>
            <ThemedText type="subtitle" style={styles.sliderTitle}>
              Deep Tick
            </ThemedText>
            <HapticSlider
              value={50}
              onValueChange={handleSlider3Change}
              style={styles.slider}
            />
          </View>
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
    paddingBottom: 32,
  },
  sliderContainer: {
    marginTop: 24,
    gap: 24,
  },
  sliderCard: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderRadius: 4,
    borderColor: '#38ACDD',
    borderWidth: 2,
    boxShadow: '-3px 3px 0px #38ACDD',
  },
  sliderTitle: {
    marginBottom: 8,
  },
  sliderDescription: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 16,
  },
  slider: {
    height: 40,
  },
});
