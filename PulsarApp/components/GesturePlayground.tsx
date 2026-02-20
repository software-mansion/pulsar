import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { Image } from 'expo-image';

const gridImage = require('@/assets/images/grid.svg');

declare global {
  var tapTimer: any;
}

export default function GesturePlayground() {
  const containerSize = useSharedValue({ width: 0, height: 0 });
  const tapIndicatorPosition = useSharedValue({ x: -100, y: -100 });
  const panIndicatorPosition = useSharedValue({ x: -100, y: -100 });

  const tapIndicatorStyle = useAnimatedStyle(() => ({
    left: tapIndicatorPosition.value.x - 15,
    top: tapIndicatorPosition.value.y - 15,
  }));

  const panIndicatorStyle = useAnimatedStyle(() => ({
    left: panIndicatorPosition.value.x - 15,
    top: panIndicatorPosition.value.y - 15,
  }));

  const handleLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    containerSize.value = { width, height };
  };

  const normalizePosition = (x: number, y: number) => {
    'worklet';
    return {
      x: containerSize.value.width > 0 ? x / containerSize.value.width : 0,
      y: containerSize.value.height > 0 ? y / containerSize.value.height : 0,
    };
  };

  const clampIndicatorPosition = (x: number, y: number) => {
    'worklet';
    if (x === -100 && y === -100) {
      return { x, y };
    }
    
    const clampedX = Math.max(15, Math.min(x, containerSize.value.width - 15));
    const clampedY = Math.max(15, Math.min(y, containerSize.value.height - 15));
    
    return { x: clampedX, y: clampedY };
  };

  const tapGesture = Gesture.Tap().onStart((e) => {
    const normalized = normalizePosition(e.x, e.y);
    console.log('Grid tapped', { absolute: { x: e.x, y: e.y }, normalized });

    const clamped = clampIndicatorPosition(e.x, e.y);
    tapIndicatorPosition.value = clamped;
    global.tapTimer = setTimeout(() => {
      tapIndicatorPosition.value = { x: -100, y: -100 };
    }, 100);

  }).onEnd(() => {
    // tapIndicatorPosition.value = { x: -100, y: -100 };
  });

  const panGesture = Gesture.Pan()
    .onBegin((e) => {
      // const normalized = normalizePosition(e.x, e.y);
      // console.log('Pan begin', { absolute: { x: e.x, y: e.y }, normalized });
      // panIndicatorPosition.value = { x: e.x, y: e.y };
    })
    .onUpdate((e) => {
      const normalized = normalizePosition(e.x, e.y);
      console.log('Pan update', { absolute: { x: e.x, y: e.y }, normalized });
      const clamped = clampIndicatorPosition(e.x, e.y);
      panIndicatorPosition.value = clamped;
    })
    .onEnd((e) => {
      // const normalized = normalizePosition(e.x, e.y);
      // console.log('Pan end', { absolute: { x: e.x, y: e.y }, normalized });
      panIndicatorPosition.value = { x: -100, y: -100 };
    });

  const composedGesture = Gesture.Simultaneous(tapGesture, panGesture);

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View  style={styles.gridContainer} onLayout={handleLayout}>
        <Animated.View style={[styles.tapIndicator, tapIndicatorStyle]} />
        <Animated.View style={[styles.panIndicator, panIndicatorStyle]} />
        <Image
          source={gridImage}
          style={styles.grid}
          contentFit="contain"
        />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  grid: {
    width: '100%',
    height: '100%',
  },
  tapIndicator: {
    position: 'absolute',
    left: -100,
    top: -100,
    zIndex: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF6259',
    opacity: 0.8,
  },
  panIndicator: {
    position: 'absolute',
    left: -100,
    top: -100,
    zIndex: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#001A72',
    opacity: 0.8,
  }
});