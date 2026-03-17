import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Presets, Settings } from 'react-native-pulsar';
import { runOnUI } from 'react-native-worklets';

interface PresetItem {
  name: string;
  displayName: string;
  play: () => void;
}

const PRESETS: PresetItem[] = [
  { name: 'SystemImpactLight', displayName: '💫 Impact Light', play: Presets.System.ImpactLight },
  { name: 'SystemImpactMedium', displayName: '⚡ Impact Medium', play: Presets.System.ImpactMedium },
  { name: 'SystemImpactHeavy', displayName: '💥 Impact Heavy', play: Presets.System.ImpactHeavy },
  { name: 'SystemImpactSoft', displayName: '🌸 Impact Soft', play: Presets.System.ImpactSoft },
  { name: 'SystemImpactRigid', displayName: '🔨 Impact Rigid', play: Presets.System.ImpactRigid },
  { name: 'SystemNotificationSuccess', displayName: '🔔 Notification Success', play: Presets.System.NotificationSuccess },
  { name: 'SystemNotificationWarning', displayName: '⚠️ Notification Warning', play: Presets.System.NotificationWarning },
  { name: 'SystemNotificationError', displayName: '🚨 Notification Error', play: Presets.System.NotificationError },
  { name: 'SystemSelection', displayName: '🎯 Selection', play: Presets.System.Selection },
// CODEGEN_BEGIN_{example_app_preset_list}
  { name: 'Earthquake', displayName: '🌍 Earthquake', play: Presets.Earthquake },
// CODEGEN_END_{example_app_preset_list}
];

export default function PresetsScreen() {
  const handlePlayPreset = (play: () => void) => {
    runOnUI(() => {
      'worklet';
      play();
    })();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Haptic Presets</Text>
        <Text style={styles.subtitle}>
          Test all available haptic presets in the Pulsar library
        </Text>

        <View style={styles.presetsList}>
          {PRESETS.map((preset) => (
            <View key={preset.name} style={styles.presetRow}>
              <Text style={styles.presetName}>{preset.displayName}</Text>
              <TouchableOpacity
                style={styles.playButton}
                onPress={() => handlePlayPreset(preset.play)}>
                <Text style={styles.playButtonText}>▶ Play</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
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
  presetsList: {
    gap: 12,
  },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  presetName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  playButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  playButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
