import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { HapticLottieView, type HapticLottieRef } from 'react-native-pulsar-lottie';
import type { Pattern } from 'react-native-pulsar';

// A haptic pattern spanning the ~2.4s "verified" animation. In the default
// `realtime` mode the animation timeline is the master clock, so the haptics
// follow play / stop / replay and land with the check: a gentle swell that
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

export default function LottieHapticsScreen() {
  const ref = useRef<HapticLottieRef>(null);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Lottie + Haptics</Text>
        <Text style={styles.subtitle}>
          HapticLottieView is a drop-in replacement for LottieView that plays a
          haptic pattern locked to the animation timeline.
        </Text>

        <View style={styles.canvas}>
          <HapticLottieView
            ref={ref}
            source={require('../../assets/verified.json')}
            haptics={verifiedPattern}
            hapticMode="realtime"
            autoPlay
            loop={false}
            style={styles.lottie}
          />
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => ref.current?.play()}>
            <Text style={styles.buttonText}>▶ Replay</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => ref.current?.stop()}>
            <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
              ■ Stop
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.note}>
          The timeline drives the haptics, so pausing or replaying the animation
          keeps them in sync automatically. Best felt on a real device.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  canvas: {
    height: 220,
    borderRadius: 12,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  lottie: {
    width: 160,
    height: 160,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#eee',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: '#333',
  },
  note: {
    fontSize: 13,
    color: '#666',
    marginTop: 24,
    lineHeight: 20,
  },
});
