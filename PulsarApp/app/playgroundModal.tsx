import { router } from 'expo-router';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Image } from 'expo-image';

const closeIcon = require('@/assets/images/x.svg');

export default function PlaygroundModal() {

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="subtitle">How does it work?</ThemedText>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Image source={closeIcon} style={styles.closeIcon} />
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="defaultSemiBold">
          Experience and shape vibrations in real-time by interacting with the grid.
        </ThemedText>

        <View style={styles.infoBox}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>How to Use:</ThemedText>
          
          <ThemedText style={styles.instruction}>
            <ThemedText style={styles.instructionLabel}>Tap the Grid: </ThemedText>
            <ThemedText style={styles.instructionText}>
              Perform a single tap to trigger a short, precise haptic pulse.
            </ThemedText>
          </ThemedText>

          <ThemedText style={styles.instruction}>
            <ThemedText style={styles.instructionLabel}>Touch & Drag: </ThemedText>
            <ThemedText style={styles.instructionText}>
              Long-press and move your finger across the board to generate a continuous vibration that follows your movement.
            </ThemedText>
          </ThemedText>

          <ThemedText type="subtitle" style={[styles.sectionTitle, styles.controlsTitle]}>Controls:</ThemedText>
          
          <ThemedText style={styles.controlsIntro}>
            The haptic feedback changes dynamically based on your finger's position:
          </ThemedText>

          <ThemedText style={styles.instruction}>
            <ThemedText style={styles.instructionLabel}>Vertical Axis (Y): </ThemedText>
            <ThemedText style={styles.instructionText}>
              Slide up or down to increase or decrease the Amplitude (vibration strength).
            </ThemedText>
          </ThemedText>

          <ThemedText style={styles.instruction}>
            <ThemedText style={styles.instructionLabel}>Horizontal Axis (X): </ThemedText>
            <ThemedText style={styles.instructionText}>
              Slide left or right to shift the Frequency (vibration speed/pitch).
            </ThemedText>
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#B5E1F1',
  },
  closeButton: {
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 12,
    paddingRight: 0,
  },
  closeIcon: {
    width: 28,
    height: 28,
  },
  scrollContent: {
    padding: 15,
  },
  infoBox: {
    backgroundColor: '#E1F3FA',
    borderRadius: 4,
    padding: 15,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  controlsTitle: {
    marginTop: 24,
  },
  instruction: {
    marginBottom: 16,
  },
  instructionLabel: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  instructionText: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
  },
  controlsIntro: {
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
});
