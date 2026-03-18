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
    description: 'Todo todo todo todo todo todo todo todo todo todo todo.',
  },
  {
    slug: 'buttons-demo',
    title: 'Buttons demo',
    description: 'Todo todo todo todo todo todo todo todo todo todo todo.',
  },
  {
    slug: 'countdown-timer-demo',
    title: 'Countdown timer',
    description: 'Todo todo todo todo todo todo todo todo todo todo todo.',
  },

  {
    slug: 'balloon-demo',
    title: 'Balloon demo',
    description: 'Todo todo todo todo todo todo todo todo todo todo todo.',
  },
  {
    slug: 'dot-loader-demo',
    title: 'Rotating Dot Loader',
    description: 'Watch three dots rotate with synchronized haptic feedback on each pass.',
  },
  {
    slug: 'notification-haptics-demo',
    title: 'Notification Haptics',
    description: 'Experience different haptic patterns for various notification types.',
  },
  {
    slug: 'sensor-haptics-demo',
    title: 'Accelerometer Haptics',
    description: 'Tilt your device and feel haptics when the dot collides or scratches the circle boundary.',
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
