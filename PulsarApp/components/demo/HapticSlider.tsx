import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

interface HapticSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  style?: ViewStyle;
}

const SLIDER_WIDTH = 300;
const THUMB_SIZE = 30;
const TRACK_HEIGHT = 6;

export default function HapticSlider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  style,
}: HapticSliderProps) {
  const [sliderWidth, setSliderWidth] = useState(SLIDER_WIDTH);
  const thumbPosition = useSharedValue(((value - min) / (max - min)) * sliderWidth);
  const isActive = useSharedValue(false);

  useEffect(() => {
    thumbPosition.value = withSpring(((value - min) / (max - min)) * sliderWidth, {
      damping: 8,
      mass: 1,
      overshootClamping: true,
    });
  }, [value, sliderWidth, min, max, thumbPosition]);

  const pan = Gesture.Pan()
    .onStart(() => {
      isActive.value = true;
    })
    .onUpdate((event) => {
      const newPosition = Math.max(
        0,
        Math.min(event.absoluteX - THUMB_SIZE / 2, sliderWidth)
      );
      thumbPosition.value = newPosition;

      const percentage = newPosition / sliderWidth;
      const newValue = min + percentage * (max - min);
      const steppedValue = Math.round(newValue / step) * step;

      runOnJS(onValueChange)(steppedValue);
    })
    .onFinalize(() => {
      isActive.value = false;
    });

  const tap = Gesture.Tap()
    .onStart((event) => {
      const newPosition = Math.max(
        0,
        Math.min(event.absoluteX - THUMB_SIZE / 2, sliderWidth)
      );
      thumbPosition.value = withSpring(newPosition, {
        damping: 8,
        mass: 1,
        overshootClamping: true,
      });

      const percentage = newPosition / sliderWidth;
      const newValue = min + percentage * (max - min);
      const steppedValue = Math.round(newValue / step) * step;

      runOnJS(onValueChange)(steppedValue);
    });

  const animatedThumbStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: thumbPosition.value - THUMB_SIZE / 2,
      },
    ],
  }));

  const filledTrackWidth = ((value - min) / (max - min)) * sliderWidth;

  return (
    <GestureDetector gesture={Gesture.Exclusive(pan, tap)}>
      <View
        style={[styles.container, style]}
        onLayout={(event) => {
          setSliderWidth(event.nativeEvent.layout.width - 10);
        }}
      >
        {/* Track background */}
        <View style={[styles.track, { width: sliderWidth }]}>
          {/* Filled track */}
          <View
            style={[
              styles.filledTrack,
              {
                width: filledTrackWidth,
              },
            ]}
          />
        </View>

        {/* Tick marks */}
        <View
          style={[
            styles.tickContainer,
            {
              width: sliderWidth,
            },
          ]}
        >
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <View
              key={i}
              style={[
                styles.tick,
                {
                  left: (i / 10) * sliderWidth,
                  backgroundColor:
                    (i / 10) * sliderWidth <= filledTrackWidth
                      ? 'rgba(255, 255, 255, 0.8)'
                      : 'rgba(255, 255, 255, 0.3)',
                },
              ]}
            />
          ))}
        </View>

        {/* Thumb */}
        <Animated.View style={[styles.thumb, animatedThumbStyle]} />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  track: {
    height: TRACK_HEIGHT,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: TRACK_HEIGHT / 2,
    overflow: 'hidden',
  },
  filledTrack: {
    height: TRACK_HEIGHT,
    backgroundColor: 'rgba(100, 200, 255, 0.8)',
    borderRadius: TRACK_HEIGHT / 2,
  },
  tickContainer: {
    position: 'absolute',
    height: TRACK_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  tick: {
    width: 2,
    height: TRACK_HEIGHT + 4,
    borderRadius: 1,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: 'rgba(100, 200, 255, 1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
