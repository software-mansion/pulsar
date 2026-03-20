import { ScrollView, StyleSheet, View } from 'react-native';
import { Pattern, usePatternComposer } from 'react-native-pulsar';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useEffect, useState } from 'react';

import BasicLayout from '@/components/BasicLayout';
import { ThemedText } from '@/components/themed-text';
import { Margins } from '@/constants/theme';
import HapticDemoButton from '@/components/demo/HapticDemoButton';

interface Notification {
  id: string;
  title: string;
  message: string;
  pattern: Pattern;
  color: string;
}

// Define different notification types with unique haptic patterns
const notifications: Notification[] = [
  {
    id: 'success',
    title: '✓ Success',
    message: 'Payment received successfully',
    color: '#10B981',
    pattern: {
      discretePattern: [
        { time: 0, amplitude: 0.9, frequency: 0.8 },
        { time: 50, amplitude: 0, frequency: 0.8 },
        { time: 100, amplitude: 1, frequency: 0.85 },
        { time: 150, amplitude: 0, frequency: 0.85 },
      ],
      continuousPattern: { amplitude: [], frequency: [] },
    },
  },
  {
    id: 'alert',
    title: '! Alert',
    message: 'Low battery warning',
    color: '#F59E0B',
    pattern: {
      discretePattern: [
        { time: 0, amplitude: 0.8, frequency: 0.3 },
        { time: 80, amplitude: 0, frequency: 0.3 },
        { time: 120, amplitude: 0.8, frequency: 0.3 },
        { time: 200, amplitude: 0, frequency: 0.3 },
      ],
      continuousPattern: { amplitude: [], frequency: [] },
    },
  },
  {
    id: 'message',
    title: '✉ Message',
    message: 'You have a new message',
    color: '#3B82F6',
    pattern: {
      discretePattern: [
        { time: 0, amplitude: 0.6, frequency: 0.9 },
        { time: 40, amplitude: 0, frequency: 0.9 },
        { time: 80, amplitude: 0.5, frequency: 0.85 },
        { time: 120, amplitude: 0, frequency: 0.85 },
      ],
      continuousPattern: { amplitude: [], frequency: [] },
    },
  },
  {
    id: 'error',
    title: '✗ Error',
    message: 'Connection failed',
    color: '#EF4444',
    pattern: {
      discretePattern: [
        { time: 0, amplitude: 1, frequency: 0.2 },
        { time: 100, amplitude: 0, frequency: 0.2 },
        { time: 150, amplitude: 0.95, frequency: 0.15 },
        { time: 250, amplitude: 0, frequency: 0.15 },
      ],
      continuousPattern: { amplitude: [], frequency: [] },
    },
  },
  {
    id: 'reminder',
    title: '◉ Reminder',
    message: 'Meeting starts in 15 minutes',
    color: '#8B5CF6',
    pattern: {
      discretePattern: [
        { time: 0, amplitude: 0.7, frequency: 0.7 },
        { time: 50, amplitude: 0, frequency: 0.7 },
        { time: 120, amplitude: 0.7, frequency: 0.7 },
        { time: 170, amplitude: 0, frequency: 0.7 },
      ],
      continuousPattern: { amplitude: [], frequency: [] },
    },
  },
];

const NotificationToast = ({ notification }: { notification: Notification }) => {
  const composer = usePatternComposer(notification.pattern);

  useEffect(() => {
    composer.play();
  }, []);

  return (
    <Animated.View
      entering={FadeInDown.springify()}
      exiting={FadeOutDown.springify()}
      style={[styles.notification, { borderLeftColor: notification.color }]}
    >
      <View style={styles.notificationContent}>
        <ThemedText style={[styles.notificationTitle, { color: notification.color }]}>
          {notification.title}
        </ThemedText>
        <ThemedText style={styles.notificationMessage}>
          {notification.message}
        </ThemedText>
      </View>
    </Animated.View>
  );
};

export default function NotificationHapticsDemo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [displayedNotification, setDisplayedNotification] = useState<Notification | null>(null);

  const playSequence = () => {
    setIsPlaying(true);
    showNextNotification(0);
  };

  const showNextNotification = (index: number) => {
    if (index >= notifications.length) {
      setIsPlaying(false);
      setDisplayedNotification(null);
      return;
    }

    setDisplayedNotification(notifications[index]);

    setTimeout(() => {
      showNextNotification(index + 1);
    }, 2500);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <BasicLayout>
        <ThemedText type="title" style={Margins.marginTop4X}>
          Notification Haptics
        </ThemedText>
        <ThemedText style={Margins.marginTop2X}>
          Each notification type has its own unique haptic pattern that matches its intention.
        </ThemedText>

        <View style={styles.notificationDisplay}>
          {displayedNotification && (
            <NotificationToast
              key={displayedNotification.id}
              notification={displayedNotification}
            />
          )}
        </View>

        <View style={styles.buttonContainer}>
          <HapticDemoButton
            label={isPlaying ? 'Playing... ' : 'Play All Notifications'}
            onPress={playSequence}
            style={styles.playButton}
          />
        </View>

      </BasicLayout>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 28,
  },
  notificationDisplay: {
    marginTop: 40,
    minHeight: 80,
    justifyContent: 'center',
  },
  notification: {
    backgroundColor: 'white',
    borderLeftWidth: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 16,
  },
  notificationContent: {
    gap: 4,
  },
  notificationTitle: {
    fontWeight: '600',
    fontSize: 14,
  },
  notificationMessage: {
    fontSize: 13,
  },
  buttonContainer: {
    marginTop: 40,
    marginHorizontal: 16,
  },
  playButton: {
    width: '100%',
  },
});
