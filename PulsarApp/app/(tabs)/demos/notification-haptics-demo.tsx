import { ScrollView, StyleSheet, View } from 'react-native';
import { Presets } from 'react-native-pulsar';
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
  play: () => void;
  color: string;
}

const notifications: Notification[] = [
  {
    id: 'success',
    title: '✓ Success',
    message: 'Payment received successfully',
    color: '#10B981',
    play: Presets.stamp,
  },
  {
    id: 'alert',
    title: '! Alert',
    message: 'Low battery warning',
    color: '#F59E0B',
    play: Presets.peal,
  },
  {
    id: 'message',
    title: '✉ Message',
    message: 'You have a new message',
    color: '#3B82F6',
    play: Presets.chime,
  },
  {
    id: 'error',
    title: '✗ Error',
    message: 'Connection failed',
    color: '#EF4444',
    play: Presets.buzz,
  },
  {
    id: 'reminder',
    title: '◉ Reminder',
    message: 'Meeting starts in 15 minutes',
    color: '#8B5CF6',
    play: Presets.swell,
  },
];

const NotificationToast = ({ notification }: { notification: Notification }) => {
  useEffect(() => {
    notification.play();
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
    }, 1000);
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
