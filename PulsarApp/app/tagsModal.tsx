import { router } from 'expo-router';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Tabs, Tab } from '@/components/Tabs';
import { TagDescription } from '@/components/TagDescription';
import { useThemeColor } from '@/hooks/use-theme-color';

const durationTags = [
  {
    name: 'Super short',
    description: 'Very short haptics pattern with duration less than 100 ms.',
    usage: 'Usage: Good as a reaction for tap events.',
  },
  {
    name: 'Short',
    description: 'Short haptic feedback lasting between 100-500ms. Provides clear tactile response without being overwhelming.',
    usage: 'Usage: Perfect for button presses, toggle switches, or confirming user actions. Commonly used in UI interactions.',
  },
  {
    name: 'Medium',
    description: 'Medium-length haptic feedback lasting between 500ms-1s. Provides noticeable feedback for moderately important actions.',
    usage: 'Usage: Ideal for notifications, alerts, or when completing a multi-step process. Draws attention without being intrusive.',
  },
  {
    name: 'Long',
    description: 'Extended haptic feedback lasting between 1-3 seconds. Creates sustained tactile sensation.',
    usage: 'Usage: Best for critical alerts, errors, or when user needs to be aware of an ongoing process. Use sparingly to avoid fatigue.',
  },
  {
    name: 'Extra long',
    description: 'Very long haptic feedback lasting more than 3 seconds. Creates prolonged tactile experience.',
    usage: 'Usage: Reserved for special cases like meditation apps, timer completions, or accessibility features requiring extended feedback.',
  },
];

const complexityTags = [
  {
    name: 'Simple',
    description: 'Basic haptic pattern with minimal variation. Single or few repetitive pulses.',
    usage: 'Usage: Quick acknowledgments, simple button taps, basic confirmations. Easy to implement and universally understood.',
  },
  {
    name: 'Moderate',
    description: 'Haptic pattern with moderate complexity. Multiple pulses with varying intensity or timing.',
    usage: 'Usage: Navigation feedback, selection changes, progress indicators. Provides more nuanced information than simple patterns.',
  },
  {
    name: 'Complex',
    description: 'Intricate haptic pattern with multiple layers, varying intensity, and sophisticated timing.',
    usage: 'Usage: Rich interactions like gaming feedback, immersive experiences, or conveying detailed information through touch.',
  },
];

const intensityTags = [
  {
    name: 'Subtle',
    description: 'Very light haptic feedback, barely noticeable. Gentle touch sensation.',
    usage: 'Usage: Background feedback, hover states, passive notifications. Great for accessibility without being disruptive.',
  },
  {
    name: 'Light',
    description: 'Light haptic feedback that is noticeable but not strong. Comfortable for frequent use.',
    usage: 'Usage: Typing feedback, scrolling indicators, minor UI interactions. Provides feedback without fatigue.',
  },
  {
    name: 'Medium',
    description: 'Moderate haptic intensity. Clear and present without being harsh.',
    usage: 'Usage: Standard button presses, selections, toggles. The most commonly used intensity level.',
  },
  {
    name: 'Strong',
    description: 'Strong haptic feedback that is clearly felt. Demands attention.',
    usage: 'Usage: Important actions, warnings, or critical notifications. Use when user attention is required.',
  },
  {
    name: 'Very strong',
    description: 'Very intense haptic feedback. Maximum tactile sensation available.',
    usage: 'Usage: Emergency alerts, critical errors, or situations requiring immediate user attention. Use very sparingly.',
  },
];

export default function TagsModal() {
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'borderColor');

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>Preset tags</ThemedText>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <ThemedText style={[styles.closeIcon, { color: textColor }]}>✕</ThemedText>
        </TouchableOpacity>
      </View>
      
      <View style={styles.tabsContainer}>
        <Tabs defaultTab={0}>
          <Tab name="Duration">
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
              {durationTags.map((tag, index) => (
                <TagDescription
                  key={index}
                  name={tag.name}
                  description={tag.description}
                  usage={tag.usage}
                />
              ))}
            </ScrollView>
          </Tab>
          
          <Tab name="Complexity">
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
              {complexityTags.map((tag, index) => (
                <TagDescription
                  key={index}
                  name={tag.name}
                  description={tag.description}
                  usage={tag.usage}
                />
              ))}
            </ScrollView>
          </Tab>
          
          <Tab name="Intensity">
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
              {intensityTags.map((tag, index) => (
                <TagDescription
                  key={index}
                  name={tag.name}
                  description={tag.description}
                  usage={tag.usage}
                />
              ))}
            </ScrollView>
          </Tab>
        </Tabs>
      </View>
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeIcon: {
    fontSize: 28,
    fontWeight: '300',
  },
  tabsContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
});
