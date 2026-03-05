import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { usePostHog } from 'posthog-react-native';

import BasicLayout from '@/components/BasicLayout';
import Card from '@/components/Card';
import { ThemedText } from '@/components/themed-text';
import { Margins } from '@/constants/theme';

const defaultEdges = {
  top: 'additive',
  left: 'additive',
  bottom: 'off',
  right: 'additive',
};

const demos = [
  {
    slug: 'slider-demo',
    title: 'Slider demo',
    description: 'Subtle ticks to confirm step-by-step navigation or onboarding progress.',
  },

  {
    slug: 'buttons-demo',
    title: 'Buttons demo',
    description: 'Micro taps on key presses to confirm input without sound.',
  },
  {
    slug: 'payment-success',
    title: 'Payment success',
    description: 'A short celebratory pulse when a payment completes successfully.',
  },
  {
    slug: 'camera-shutter',
    title: 'Camera shutter',
    description: 'A crisp click when capturing a photo to reinforce the shutter action.',
  },
  {
    slug: 'workout-interval',
    title: 'Workout interval',
    description: 'Guided pulses for interval changes without looking at the screen.',
  },
];

export default function DemosScreen() {
  const posthog = usePostHog();

  return (
    <SafeAreaView edges={defaultEdges as any} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <BasicLayout>
          <ThemedText type="title" style={Margins.marginTop4X}>
            Real-world haptics demos
          </ThemedText>
          <ThemedText style={Margins.marginTop2X}>
            Pick a scenario to see how haptics can improve everyday interactions.
          </ThemedText>

          <View style={styles.list}>
            {demos.map((demo) => (
              <Link
                key={demo.slug}
                href={`/demos/${demo.slug}` as any}
                onPress={() => {
                  posthog.capture('demo_opened', {
                    demo_slug: demo.slug,
                    demo_title: demo.title,
                  });
                }}
              >
                <Link.Trigger>
                  <Card style={styles.card}>
                    <ThemedText type="subtitle" style={styles.cardTitle}>
                      {demo.title}
                    </ThemedText>
                    <ThemedText style={styles.cardDescription}>{demo.description}</ThemedText>
                    <ThemedText style={styles.cardLink}>Open demo </ThemedText>
                  </Card>
                </Link.Trigger>
              </Link>
            ))}
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
    paddingBottom: 24,
  },
  list: {
    marginTop: 20,
    gap: 12,
  },
  card: {
    paddingVertical: 18,
  },
  cardTitle: {
    fontSize: 20,
    lineHeight: 26,
  },
  cardDescription: {
    marginTop: 6,
  },
  cardLink: {
    marginTop: 10,
    color: '#001A72',
  },
});
