import { ScrollView, StyleSheet, View } from 'react-native';
import { useRealtimeComposer } from 'react-native-pulsar';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  interpolate,
  Extrapolation,
  SensorType,
  useAnimatedSensor,
} from 'react-native-reanimated';

import BasicLayout from '@/components/BasicLayout';
import { ThemedText } from '@/components/themed-text';
import { Margins } from '@/constants/theme';

const CIRCLE_RADIUS = 150;
const CIRCLE_BORDER_WIDTH = 2;
const DOT_SIZE = 30;
const CENTER_X = CIRCLE_RADIUS - CIRCLE_BORDER_WIDTH; // Center of circle from left
const CENTER_Y = CIRCLE_RADIUS - CIRCLE_BORDER_WIDTH; // Center of circle from top

export default function SensorHapticsDemo() {
  const accelerometer = useAnimatedSensor(SensorType.ACCELEROMETER);
  const composer = useRealtimeComposer();

  const dotX = useSharedValue(CENTER_X - DOT_SIZE / 2);
  const dotY = useSharedValue(CENTER_Y - DOT_SIZE / 2);
  const velocityX = useSharedValue(0);
  const velocityY = useSharedValue(0);
  const lastCollisionTime = useSharedValue(0);
  const lastScratchTime = useSharedValue(0);
  const isColliding = useSharedValue(false);

  useAnimatedReaction(
    () => ({
      x: accelerometer.sensor.value.x,
      y: accelerometer.sensor.value.y,
    }),
    ({ x, y }) => {
      const scale = 0.6;
      velocityX.value += x * scale;
      velocityY.value -= y * scale;
      velocityX.value *= 0.8;
      velocityY.value *= 0.8;

      const newX = dotX.value + velocityX.value;
      const newY = dotY.value + velocityY.value;

      const dotCenterX = newX + DOT_SIZE / 2;
      const dotCenterY = newY + DOT_SIZE / 2;
      const dx = dotCenterX - CENTER_X;
      const dy = dotCenterY - CENTER_Y;
      const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
      const maxDistance = CIRCLE_RADIUS - DOT_SIZE / 2 - CIRCLE_BORDER_WIDTH;
      const velocityMagnitude = Math.sqrt(velocityX.value * velocityX.value + velocityY.value * velocityY.value);

      if (distanceFromCenter > maxDistance) {
        // Constrain dot to circle boundary
        const angle = Math.atan2(dy, dx);
        dotX.value = CENTER_X + Math.cos(angle) * maxDistance - DOT_SIZE / 2;
        dotY.value = CENTER_Y + Math.sin(angle) * maxDistance - DOT_SIZE / 2;

        // Bounce back: only reverse the radial (normal) component, preserve tangential
        const nx = dx / distanceFromCenter;
        const ny = dy / distanceFromCenter;
        const radial = velocityX.value * nx + velocityY.value * ny;
        velocityX.value = velocityX.value - (1 + 0.6) * radial * nx;
        velocityY.value = velocityY.value - (1 + 0.6) * radial * ny;

        // Only play collision haptic on first contact, not while already pressed against edge
        if (!isColliding.value) {
          isColliding.value = true;
          composer.stop();

          const currentTime = Date.now();
          if (velocityMagnitude > 2) {
            if (currentTime - lastCollisionTime.value > 200) {
              lastCollisionTime.value = currentTime;
              composer.playDiscrete(1.0, 1.0);
            }
          } else if (velocityMagnitude > 0.3) {
            if (currentTime - lastScratchTime.value > 200) {
              lastScratchTime.value = currentTime;
              composer.playDiscrete(0.6, 0.35);
            }
          }
        }
      } else {
        if (distanceFromCenter < maxDistance * 0.85) {
          isColliding.value = false;
        }
        dotX.value = newX;
        dotY.value = newY;

        // Rolling texture: map velocity magnitude to amplitude and frequency
        if (velocityMagnitude > 0.5) {
          const amplitude = interpolate(velocityMagnitude, [0.5, 12], [0.1, 0.5], Extrapolation.CLAMP);
          const frequency = interpolate(velocityMagnitude, [0.5, 12], [0.2, 0.7], Extrapolation.CLAMP);
          composer.set(amplitude, frequency);
        } else {
          composer.stop();
        }
      }
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
          Tilt your device to move the dot inside the circle. Feel different haptics as the dot moves.
        </ThemedText>

        <View style={styles.demoContainer}>
          <View style={styles.circle}>
            <Animated.View
              style={[
                styles.dot,
                dotAnimatedStyle,
              ]}
            />
          </View>
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
    borderWidth: CIRCLE_BORDER_WIDTH,
    borderColor: '#001A72',
    backgroundColor: 'white',
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: '#001A72',
  },
});
