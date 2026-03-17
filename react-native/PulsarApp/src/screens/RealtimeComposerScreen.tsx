import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';
import { useRealtimeComposer } from 'react-native-pulsar';

export default function RealtimeComposerScreen() {
  const composer = useRealtimeComposer();
  const containerSize = useSharedValue({ width: 300, height: 300 });
  const tapIndicatorPosition = useSharedValue({ x: -100, y: -100 });
  const panIndicatorPosition = useSharedValue({ x: -100, y: -100 });

  const handleLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    containerSize.value = { width, height };
  };

  const clampValue = (value: number, min: number, max: number) => {
    'worklet';
    return Math.max(min, Math.min(value, max));
  };

  const tap = Gesture.Tap()
    .onStart((event: any) => {
      'worklet';
      const x = clampValue(event.x, 15, containerSize.value.width - 15);
      const y = clampValue(event.y, 15, containerSize.value.height - 15);
      
      tapIndicatorPosition.value = { x, y };

      // Normalized values (0-100)
      const normalizedX = (x / containerSize.value.width) * 100;
      const normalizedY = ((containerSize.value.height - y) / containerSize.value.height) * 100;

      composer.playDiscrete(normalizedY, normalizedX);

      // Reset indicator after a short delay
      setTimeout(() => {
        tapIndicatorPosition.value = { x: -100, y: -100 };
      }, 150);
    });

  const pan = Gesture.Pan()
    .onStart((event: any) => {
      'worklet';
      const x = clampValue(event.x, 15, containerSize.value.width - 15);
      const y = clampValue(event.y, 15, containerSize.value.height - 15);
      
      panIndicatorPosition.value = { x, y };

      const normalizedX = (x / containerSize.value.width);
      const normalizedY = ((containerSize.value.height - y) / containerSize.value.height);

      composer.set(normalizedY, normalizedX);
    })
    .onUpdate((event: any) => {
      'worklet';
      const x = clampValue(event.x, 15, containerSize.value.width - 15);
      const y = clampValue(event.y, 15, containerSize.value.height - 15);
      
      panIndicatorPosition.value = { x, y };

      const normalizedX = (x / containerSize.value.width);
      const normalizedY = ((containerSize.value.height - y) / containerSize.value.height);

      composer.set(normalizedY, normalizedX);
    })
    .onEnd(() => {
      'worklet';
      panIndicatorPosition.value = { x: -100, y: -100 };
      composer.stop();
    });

  const composedGesture = Gesture.Simultaneous(tap, pan);

  const tapIndicatorStyle = useAnimatedStyle(() => ({
    left: tapIndicatorPosition.value.x - 15,
    top: tapIndicatorPosition.value.y - 15,
  }));

  const panIndicatorStyle = useAnimatedStyle(() => ({
    left: panIndicatorPosition.value.x - 15,
    top: panIndicatorPosition.value.y - 15,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Realtime Composer</Text>
        <Text style={styles.subtitle}>
          Tap for discrete haptics • Drag for continuous haptics
        </Text>
        <Text style={styles.instructions}>
          X-axis controls frequency, Y-axis controls intensity
        </Text>

        <GestureDetector gesture={composedGesture}>
          <Animated.View style={styles.gestureArea} onLayout={handleLayout}>
            <View style={styles.grid}>
              {/* Grid lines */}
              <View style={styles.gridLine} />
              <View style={[styles.gridLine, styles.gridLineVertical]} />
            </View>

            {/* Indicators */}
            <Animated.View style={[styles.tapIndicator, tapIndicatorStyle]} />
            <Animated.View style={[styles.panIndicator, panIndicatorStyle]} />

            {/* Labels */}
            <Text style={styles.labelTop}>High Intensity</Text>
            <Text style={styles.labelBottom}>Low Intensity</Text>
            <Text style={styles.labelLeft}>Low Freq</Text>
            <Text style={styles.labelRight}>High Freq</Text>
          </Animated.View>
        </GestureDetector>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF6259' }]} />
            <Text style={styles.legendText}>Tap (Discrete)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#001A72' }]} />
            <Text style={styles.legendText}>Drag (Continuous)</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
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
    marginBottom: 4,
  },
  instructions: {
    fontSize: 12,
    color: '#999',
    marginBottom: 24,
  },
  gestureArea: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    position: 'relative',
    minHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridLine: {
    position: 'absolute',
    width: '80%',
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  gridLineVertical: {
    width: 1,
    height: '80%',
  },
  tapIndicator: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF6259',
    opacity: 0.8,
  },
  panIndicator: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#001A72',
    opacity: 0.8,
  },
  labelTop: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  labelBottom: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  labelLeft: {
    position: 'absolute',
    left: 12,
    top: '50%',
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
    transform: [{ translateY: -10 }],
  },
  labelRight: {
    position: 'absolute',
    right: 12,
    top: '50%',
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
    transform: [{ translateY: -10 }],
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 20,
    paddingVertical: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
  },
});
