import { router } from 'expo-router';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';


export default function PlaygroundModal() {
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'borderColor');
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>How does it work?</ThemedText>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <ThemedText style={[styles.closeIcon, { color: textColor }]}>✕</ThemedText>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <ThemedText style={styles.subtitle}>
          Experience and shape vibrations in real-time by interacting with the grid.
        </ThemedText>

        <View style={[styles.infoBox, { backgroundColor: backgroundColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>How to Use:</ThemedText>
          
          <View style={styles.instruction}>
            <ThemedText style={styles.instructionLabel}>Tap the Grid: </ThemedText>
            <ThemedText style={styles.instructionText}>
              Perform a single tap to trigger a short, precise haptic pulse.
            </ThemedText>
          </View>

          <View style={styles.instruction}>
            <ThemedText style={styles.instructionLabel}>Touch & Drag: </ThemedText>
            <ThemedText style={styles.instructionText}>
              Long-press and move your finger across the board to generate a continuous vibration that follows your movement.
            </ThemedText>
          </View>

          <ThemedText type="subtitle" style={[styles.sectionTitle, styles.controlsTitle]}>Controls:</ThemedText>
          
          <ThemedText style={styles.controlsIntro}>
            The haptic feedback changes dynamically based on your finger's position:
          </ThemedText>

          <View style={styles.instruction}>
            <ThemedText style={styles.instructionLabel}>Vertical Axis (Y): </ThemedText>
            <ThemedText style={styles.instructionText}>
              Slide up or down to increase or decrease the Amplitude (vibration strength).
            </ThemedText>
          </View>

          <View style={styles.instruction}>
            <ThemedText style={styles.instructionLabel}>Horizontal Axis (X): </ThemedText>
            <ThemedText style={styles.instructionText}>
              Slide left or right to shift the Frequency (vibration speed/pitch).
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  closeIcon: {
    fontSize: 28,
    fontWeight: '300',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 24,
  },
  infoBox: {
    backgroundColor: '#F5F8FA',
    borderRadius: 12,
    padding: 20,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
});
