import { StyleSheet, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { useHapticsComposer, Pattern } from 'react-native-pulsar';

import BasicLayout from '@/components/BasicLayout';
import { ThemedText } from '@/components/themed-text';
import { Margins } from '@/constants/theme';
import HapticSlider from '@/components/demo/HapticSlider';

const defaultEdges = {
  top: 'additive',
  left: 'additive',
  bottom: 'off',
  right: 'additive',
};

// Pattern 1: Quick short tick (sharp click sound)
const quickTickPattern: Pattern = {
  discretePattern: [
    { time: 0, amplitude: 1, frequency: 1 },
    { time: 40, amplitude: 0, frequency: 1 },
  ],
  continuousPattern: {
    amplitude: [],
    frequency: [],
  },
};

// Pattern 2: Medium soft tick (gentle feedback)
const softTickPattern: Pattern = {
  discretePattern: [
    { time: 0, amplitude: 0.6, frequency: 0.4 },
    { time: 60, amplitude: 0, frequency: 0.4 },
  ],
  continuousPattern: {
    amplitude: [],
    frequency: [],
  },
};

// Pattern 3: Deep resonant tick (bass-like feedback)
const deepTickPattern: Pattern = {
  discretePattern: [
    { time: 0, amplitude: 0.8, frequency: 0.2 },
    { time: 80, amplitude: 0, frequency: 0.2 },
  ],
  continuousPattern: {
    amplitude: [],
    frequency: [],
  },
};

export default function SliderDemo() {
  const [value1, setValue1] = useState(50);
  const [value2, setValue2] = useState(50);
  const [value3, setValue3] = useState(50);

  const quickTickComposer = useHapticsComposer(quickTickPattern);
  const softTickComposer = useHapticsComposer(softTickPattern);
  const deepTickComposer = useHapticsComposer(deepTickPattern);

  const handleSlider1Change = useCallback((newValue: number) => {
    const oldTick = Math.floor(value1 / 10);
    const newTick = Math.floor(newValue / 10);
    
    if (oldTick !== newTick) {
      quickTickComposer.play();
    }
    setValue1(newValue);
  }, [value1, quickTickComposer]);

  const handleSlider2Change = useCallback((newValue: number) => {
    const oldTick = Math.floor(value2 / 10);
    const newTick = Math.floor(newValue / 10);
    
    if (oldTick !== newTick) {
      softTickComposer.play();
    }
    setValue2(newValue);
  }, [value2, softTickComposer]);

  const handleSlider3Change = useCallback((newValue: number) => {
    const oldTick = Math.floor(value3 / 10);
    const newTick = Math.floor(newValue / 10);
    
    if (oldTick !== newTick) {
      deepTickComposer.play();
    }
    setValue3(newValue);
  }, [value3, deepTickComposer]);

  return (
    <SafeAreaView edges={defaultEdges as any} style={styles.safeArea}>
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
              <ThemedText style={styles.sliderDescription}>
                Sharp, fast feedback (High frequency)
              </ThemedText>
              <HapticSlider
                value={value1}
                onValueChange={handleSlider1Change}
                style={styles.slider}
              />
              <ThemedText style={styles.sliderValue}>
                Value: {Math.round(value1)}
              </ThemedText>
            </View>

            <View style={styles.sliderCard}>
              <ThemedText type="subtitle" style={styles.sliderTitle}>
                Soft Tick
              </ThemedText>
              <ThemedText style={styles.sliderDescription}>
                Gentle, subtle feedback (Medium frequency)
              </ThemedText>
              <HapticSlider
                value={value2}
                onValueChange={handleSlider2Change}
                style={styles.slider}
              />
              <ThemedText style={styles.sliderValue}>
                Value: {Math.round(value2)}
              </ThemedText>
            </View>

            <View style={styles.sliderCard}>
              <ThemedText type="subtitle" style={styles.sliderTitle}>
                Deep Tick
              </ThemedText>
              <ThemedText style={styles.sliderDescription}>
                Resonant, powerful feedback (Low frequency)
              </ThemedText>
              <HapticSlider
                value={value3}
                onValueChange={handleSlider3Change}
                style={styles.slider}
              />
              <ThemedText style={styles.sliderValue}>
                Value: {Math.round(value3)}
              </ThemedText>
            </View>
          </View>
        </BasicLayout>
      </ScrollView>
    </SafeAreaView>
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
    borderRadius: 12,
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
    marginVertical: 12,
    height: 40,
  },
  sliderValue: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.8,
  },
});
