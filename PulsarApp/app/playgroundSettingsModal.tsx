import { router } from 'expo-router';
import { StyleSheet, ScrollView, View, TouchableOpacity, Platform, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Image } from 'expo-image';
import { usePlayground } from '@/contexts/PlaygroundContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RealtimeComposerStrategy } from 'react-native-pulsar';
import { usePostHog } from 'posthog-react-native';
import { useEffect } from 'react';

const closeIcon = require('@/assets/images/x.svg');

const REALTIME_COMPOSER_STRATEGIES: { label: string; value: RealtimeComposerStrategy; description: string }[] = [
  {
    label: 'Envelope+Discrete',
    value: RealtimeComposerStrategy.ENVELOPE_WITH_DISCRETE_PRIMITIVES,
    description: 'Balanced default for mixed continuous and discrete feedback.',
  },
  {
    label: 'Envelope',
    value: RealtimeComposerStrategy.ENVELOPE,
    description: 'Best when the interaction leans heavily on continuous haptics.',
  },
  {
    label: 'Primitive Complex',
    value: RealtimeComposerStrategy.PRIMITIVE_COMPLEX,
    description: 'A richer primitive-based option for devices with stronger support.',
  },
  {
    label: 'Primitive Tick',
    value: RealtimeComposerStrategy.PRIMITIVE_TICK,
    description: 'The lightest primitive option, useful when you want a simpler feel.',
  },
];

export default function PlaygroundSettingsModal() {
  const { selectedStrategy, setSelectedStrategy } = usePlayground();
  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture('playground_settings_opened', {
      platform: Platform.OS,
      selected_strategy: selectedStrategy,
    });
  }, [posthog, selectedStrategy]);

  const handleStrategySelection = (label: string, value: RealtimeComposerStrategy) => {
    setSelectedStrategy(value);
    posthog.capture('playground_strategy_selected', {
      platform: Platform.OS,
      strategy: value,
      strategy_label: label,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Playground settings</ThemedText>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Image source={closeIcon} style={styles.closeIcon} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText type="defaultSemiBold">
            Tune how the real-time composer behaves in the playground.
          </ThemedText>

          {Platform.OS === 'android' ? (
            <View style={styles.infoBox}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>Realtime strategy</ThemedText>
              <ThemedText style={styles.controlsIntro}>
                Choose how Android simulates continuous haptics in the playground.
              </ThemedText>

              <View style={styles.optionsList}>
                {REALTIME_COMPOSER_STRATEGIES.map(({ label, value, description }) => {
                  const isSelected = selectedStrategy === value;
                  return (
                    <Pressable
                      key={value}
                      style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                      onPress={() => handleStrategySelection(label, value)}
                    >
                      <View style={styles.optionHeader}>
                        <ThemedText type="defaultSemiBold">{label}</ThemedText>
                        <View style={[styles.optionIndicator, isSelected && styles.optionIndicatorSelected]} />
                      </View>
                      <ThemedText style={styles.optionDescription}>{description}</ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : (
            <View style={styles.infoBox}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>Realtime strategy</ThemedText>
              <ThemedText style={styles.optionDescription}>
                Strategy selection is available only on Android. iOS uses the native continuous haptics implementation.
              </ThemedText>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
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
  controlsIntro: {
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  optionsList: {
    gap: 12,
  },
  optionCard: {
    borderWidth: 2,
    borderColor: '#87CCE8',
    borderRadius: 8,
    backgroundColor: 'white',
    padding: 12,
  },
  optionCardSelected: {
    borderColor: '#001A72',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 6,
  },
  optionIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#87CCE8',
    backgroundColor: 'transparent',
  },
  optionIndicatorSelected: {
    borderColor: '#001A72',
    backgroundColor: '#001A72',
  },
  optionDescription: {
    fontSize: 15,
    lineHeight: 22,
  },
});
