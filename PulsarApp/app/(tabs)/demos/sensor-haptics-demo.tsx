import { ScrollView, StyleSheet, View } from 'react-native';
import { Pattern, usePatternComposer } from 'react-native-pulsar';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  runOnJS,
  interpolate,
  SensorType,
  useAnimatedSensor,
} from 'react-native-reanimated';
import { useEffect, useRef } from 'react';

import BasicLayout from '@/components/BasicLayout';
import { ThemedText } from '@/components/themed-text';
import { Margins } from '@/constants/theme';

const CIRCLE_RADIUS = 100;
const DOT_SIZE = 16;
const CENTER_X = 150; // Center of circle from left
const CENTER_Y = 150; // Center of circle from top

// Collision haptic: sharp, hard hit
const collisionPattern: Pattern = {
  discretePattern: [
    { time: 0, amplitude: 1, frequency: 1 },
    { time: 60, amplitude: 0, frequency: 1 },
  ],
  continuousPattern: { amplitude: [], frequency: [] },
};

// Scratch haptic: soft, grazing touch
const scratchPattern: Pattern = {
  discretePattern: [
    { time: 0, amplitude: 0.5, frequency: 0.4 },
    { time: 50, amplitude: 0, frequency: 0.4 },
    { time: 100, amplitude: 0.4, frequency: 0.35 },
    { time: 150, amplitude: 0, frequency: 0.35 },
  ],
  continuousPattern: { amplitude: [], frequency: [] },
};

export default function SensorHapticsDemo() {
  const accelerometer = useAnimatedSensor(SensorType.ACCELEROMETER);

  const dotX = useSharedValue(CENTER_X - DOT_SIZE / 2);
  const dotY = useSharedValue(CENTER_Y - DOT_SIZE / 2);
  const velocityX = useSharedValue(0);
  const velocityY = useSharedValue(0);
  const lastX = useSharedValue(0);
  const lastY = useSharedValue(0);
  const isAtBoundary = useSharedValue(false);
  const lastCollisionTime = useSharedValue(0);

  const collisionComposer = usePatternComposer(collisionPattern);
  const scratchComposer = usePatternComposer(scratchPattern);

  const hasTriggeredCollision = useRef(false);
  const hasTriggeredScratch = useRef(false);

  useAnimatedReaction(
    () => ({
      x: accelerometer.sensor.x.value,
      y: accelerometer.sensor.y.value,
    }),
    ({ x, y }) => {
      // Apply acceleration (gravity-like effect)
      // Scale sensor values to reasonable movement speed
      const scale = 1.5;
      velocityX.value += x * scale;
      velocityY.value += y * scale;

      // Apply friction to slow down movement
      velocityX.value *= 0.95;
      velocityY.value *= 0.95;

      // Update position
      const newX = dotX.value + velocityX.value;
      const newY = dotY.value + velocityY.value;

      // Calculate distance from center
      const dotCenterX = newX + DOT_SIZE / 2;
      const dotCenterY = newY + DOT_SIZE / 2;

      const dx = dotCenterX - CENTER_X;
      const dy = dotCenterY - CENTER_Y;
      const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
      const maxDistance = CIRCLE_RADIUS - DOT_SIZE / 2;

      // Detect if dot is at boundary
      const velocityMagnitude = Math.sqrt(velocityX.value * velocityX.value + velocityY.value * velocityY.value);
      const atBoundary = distanceFromCenter >= maxDistance - 5;

      if (atBoundary) {
        // Constrain dot to circle
        if (distanceFromCenter > maxDistance) {
          const angle = Math.atan2(dy, dx);
          const constrainedX = CENTER_X + Math.cos(angle) * maxDistance - DOT_SIZE / 2;
          const constrainedY = CENTER_Y + Math.sin(angle) * maxDistance - DOT_SIZE / 2;

          dotX.value = constrainedX;
          dotY.value = constrainedY;

          // Bounce back effect
          velocityX.value = -velocityX.value * 0.6;
          velocityY.value = -velocityY.value * 0.6;

          // Distinguish between collision and scratch based on velocity
          const currentTime = Date.now();

          if (velocityMagnitude > 2) {
            // High velocity = collision (hard impact)
            if (currentTime - lastCollisionTime.value > 200) {
              // Debounce to prevent multiple triggers
              lastCollisionTime.value = currentTime;
              runOnJS(collisionComposer.play)();
              hasTriggeredCollision.current = true;
              hasTriggeredScratch.current = false;
            }
          } else if (velocityMagnitude > 0.3 && atBoundary && !hasTriggeredScratch.current && !hasTriggeredCollision.current) {
            // Low velocity at boundary = scratch (gentle touch)
            runOnJS(scratchComposer.play)();
            hasTriggeredScratch.current = true;
            hasTriggeredCollision.current = false;
          }
        }

        isAtBoundary.value = true;
      } else {
        isAtBoundary.value = false;
        hasTriggeredCollision.current = false;
        hasTriggeredScratch.current = false;

        // Normal movement inside circle
        dotX.value = newX;
        dotY.value = newY;
      }

      lastX.value = newX;
      lastY.value = newY;
    }
  );

  const dotAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: dotX.value },
      { translateY: dotY.value },
    ],
  }));

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <BasicLayout>
        <ThemedText type="title" style={Margins.marginTop4X}>
          Accelerometer Haptics
        </ThemedText>
        <ThemedText style={Margins.marginTop2X}>
          Tilt your device to move the dot inside the circle. Feel different haptics when the dot collides or scratches the boundary.
        </ThemedText>

        {/* Center circle container */}
        <View style={styles.demoContainer}>
          <View style={styles.circle}>
            {/* Animated dot inside circle */}
            <Animated.View
              style={[
                styles.dot,
                dotAnimatedStyle,
              ]}
            />
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoBox}>
            <ThemedText style={[styles.infoLabel, { color: '#EF4444' }]}>
              ⚡ Collision
            </ThemedText>
            <ThemedText style={styles.infoDesc}>
              Fast impact with boundary
            </ThemedText>
            <ThemedText style={styles.infoHaptic}>
              Sharp, strong haptic
            </ThemedText>
          </View>

          <View style={styles.infoBox}>
            <ThemedText style={[styles.infoLabel, { color: '#F59E0B' }]}>
              ✨ Scratch
            </ThemedText>
            <ThemedText style={styles.infoDesc}>
              Gentle touch at boundary
            </ThemedText>
            <ThemedText style={styles.infoHaptic}>
              Soft, subtle haptic
            </ThemedText>
          </View>
        </View>

        <View style={styles.instructionSection}>
          <ThemedText style={styles.instructionText}>
            💡 Tilt your phone in different directions to move the dot. Feel how the haptic feedback changes based on the collision intensity—hard hits feel sharp and punchy, while gentle touches feel soft and subtle.
          </ThemedText>
        </View>
      </BasicLayout>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 28,
  },
  demoContainer: {
    marginTop: 40,
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: CIRCLE_RADIUS * 2,
    height: CIRCLE_RADIUS * 2,
    borderRadius: CIRCLE_RADIUS,
    borderWidth: 2,
    borderColor: '#001A72',
    backgroundColor: '#F9F9F9',
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: '#001A72',
  },
  infoGrid: {
    marginHorizontal: 16,
    gap: 12,
  },
  infoBox: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#001A72',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  infoHaptic: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  instructionSection: {
    marginTop: 40,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  instructionText: {
    lineHeight: 22,
    color: '#1F2937',
  },
});
