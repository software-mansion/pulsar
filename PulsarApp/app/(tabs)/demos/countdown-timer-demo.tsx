import { StyleSheet, View } from 'react-native';
import { useEffect, useState } from 'react';
import { Pattern, usePatternComposer } from 'react-native-pulsar';

import BasicLayout from '@/components/BasicLayout';
import { ThemedText } from '@/components/themed-text';
import { Margins } from '@/constants/theme';
import HapticDemoButton from '@/components/demo/HapticDemoButton';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';

export default function CountdownTimerDemo() {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);

  // Pattern for regular countdown ticks (0.5-3 seconds)
  const tickPattern: Pattern = {
    discretePattern: [
      { time: 0, amplitude: 0.6, frequency: 0.7 },
      { time: 30, amplitude: 0, frequency: 0.7 },
    ],
    continuousPattern: { amplitude: [], frequency: [] },
  };

  // Pattern for final 3 seconds (more intense)
  const finalTickPattern: Pattern = {
    discretePattern: [
      { time: 0, amplitude: 0.85, frequency: 0.85 },
      { time: 40, amplitude: 0, frequency: 0.85 },
    ],
    continuousPattern: { amplitude: [], frequency: [] },
  };

  // Pattern for completion
  const completePattern: Pattern = {
    discretePattern: [
      { time: 0, amplitude: 0.9, frequency: 0.5 },
      { time: 50, amplitude: 0, frequency: 0.5 },
      { time: 100, amplitude: 0.9, frequency: 0.5 },
      { time: 150, amplitude: 0, frequency: 0.5 },
    ],
    continuousPattern: { amplitude: [], frequency: [] },
  };

  const tickComposer = usePatternComposer(tickPattern);
  const finalTickComposer = usePatternComposer(finalTickPattern);
  const completeComposer = usePatternComposer(completePattern);

  // Timer effect
  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) {
          return 7;
        }
        if (prev > 0) {
          const next = prev - 1;
          // Play haptic feedback
          if (next > 2) {
            tickComposer.play();
          } else if (next > 0) {
            finalTickComposer.play();
          } else {
            completeComposer.play();
            setIsActive(false);
            return null;
          }
          return next;
        }
        return 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, tickComposer, finalTickComposer, completeComposer]);

  const handleStart = () => {
    setCountdown(7);
    setIsActive(true);
  };

  const handleReset = () => {
    setCountdown(null);
    setIsActive(false);
  };

  return (
    <BasicLayout>
      <ThemedText type="title" style={Margins.marginTop4X}>
        Countdown timer
      </ThemedText>
      <ThemedText style={Margins.marginTop2X}>
        Experience haptic feedback synced to a countdown timer.
      </ThemedText>

      <View style={styles.timerContainer}>
        <Animated.View key={countdown} entering={FadeInUp} exiting={FadeOutDown}>
          <ThemedText 
            type="title" 
            style={[
              styles.timerText,
              countdown !== null && countdown > 0 && countdown <= 3 && styles.timerTextWarning
            ]}
          >
            {countdown !== null ? countdown : '...'}
          </ThemedText>
        </Animated.View>
        <ThemedText style={styles.statusText}>
          {countdown === null && !isActive && 'Ready to start'}
          {isActive && countdown === 0 && 'Complete!'}
          {isActive && countdown !== 0 && `${countdown} seconds left`}
        </ThemedText>
      </View>

      <View style={styles.controls}>
        <HapticDemoButton
          label={countdown === null ? 'Start Countdown' : 'Reset'}
          onPress={countdown === null ? handleStart : handleReset}
        />
      </View>
    </BasicLayout>
  );
}

const styles = StyleSheet.create({
  timerContainer: {
    marginTop: 40,
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: 'white',
    borderRadius: 16,
  },
  timerText: {
    fontSize: 72,
    fontWeight: 'bold',
    lineHeight: 80,
  },
  timerTextWarning: {
    color: '#FF3B30',
  },
  statusText: {
    marginTop: 12,
    fontSize: 14,
    opacity: 0.7,
  },
  controls: {
    marginTop: 30,
    gap: 12,
  },
  infoTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
