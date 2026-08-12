import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { usePatternComposer, type Pattern } from 'react-native-pulsar';

// A haptic pattern authored to sync with `assets/sample-3s.mp3`. The discrete
// beats land on the track's onsets, while the continuous envelope traces its
// energy. Attach the audio through the `sound` field and `usePatternComposer`
// registers it as a Core Haptics audio event (iOS) or plays it alongside the
// generated haptics (Android), on a shared clock. `require()` resolves to a
// remote Metro URL in dev but a local file in release — verify sync on a
// release build / real device.
const audioPattern: Pattern = {
  discretePattern: [
    { time: 70, amplitude: 0.299, frequency: 0.159 },
    { time: 232, amplitude: 0.401, frequency: 0.416 },
    { time: 441, amplitude: 0.627, frequency: 0.663 },
    { time: 627, amplitude: 0.31, frequency: 0.607 },
    { time: 836, amplitude: 0.792, frequency: 0.634 },
    { time: 1022, amplitude: 0.394, frequency: 0.379 },
    { time: 1231, amplitude: 0.806, frequency: 0.679 },
    { time: 1440, amplitude: 0.612, frequency: 0.525 },
    { time: 1649, amplitude: 0.232, frequency: 0.767 },
    { time: 2020, amplitude: 0.239, frequency: 0.625 },
    { time: 2438, amplitude: 0.385, frequency: 0.743 },
    { time: 2624, amplitude: 0.226, frequency: 0.468 },
    { time: 2833, amplitude: 0.446, frequency: 0.733 },
  ],
  continuousPattern: {
    amplitude: [
      { time: 0, value: 1 },
      { time: 209, value: 0.927 },
      { time: 348, value: 0.843 },
      { time: 580, value: 0.789 },
      { time: 720, value: 0.791 },
      { time: 859, value: 0.693 },
      { time: 1022, value: 0.718 },
      { time: 1161, value: 0.665 },
      { time: 1324, value: 0.565 },
      { time: 1463, value: 0.432 },
      { time: 1649, value: 0.201 },
      { time: 1788, value: 0.068 },
      { time: 3181, value: 0.014 },
    ],
    frequency: [
      { time: 0, value: 0.402 },
      { time: 232, value: 0.061 },
      { time: 604, value: 0.077 },
      { time: 836, value: 0.23 },
      { time: 1068, value: 0.293 },
      { time: 1324, value: 0.346 },
      { time: 1625, value: 0.437 },
      { time: 1904, value: 0.513 },
      { time: 2206, value: 0.63 },
      { time: 2438, value: 0.822 },
      { time: 2670, value: 0.975 },
      { time: 2902, value: 0.947 },
      { time: 3181, value: 0.861 },
    ],
  },
  sound: { uri: require('../assets/sample-3s.mp3'), volume: 1.0 },
};

export default function AudioHapticsScreen() {
  const composer = usePatternComposer(audioPattern);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Audio-synced haptics</Text>
        <Text style={styles.subtitle}>
          A 3-second music clip played through the pattern composer, with haptics
          authored to land on the beat. Best felt on a real device.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>sample-3s.mp3</Text>
          <Text style={styles.cardHint}>
            13 discrete beats + a continuous energy envelope
          </Text>

          <TouchableOpacity
            style={styles.playButton}
            onPress={() => composer.play()}>
            <Text style={styles.playButtonText}>▶ Play with haptics</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.stopButton}
            onPress={() => composer.stop()}>
            <Text style={styles.stopButtonText}>■ Stop</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.note}>
          The audio is attached via the pattern's{' '}
          <Text style={styles.mono}>sound</Text> field, so audio and haptics share
          one clock — no manual scheduling.
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
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    gap: 12,
  },
  cardLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cardHint: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  playButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  playButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  stopButton: {
    backgroundColor: '#eee',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  stopButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    fontSize: 13,
    color: '#666',
    marginTop: 24,
    lineHeight: 20,
  },
  mono: {
    fontFamily: 'Courier',
    color: '#333',
  },
});
