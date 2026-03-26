import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  SharedValue,
} from 'react-native-reanimated';

interface HapticSliderProps {
  value: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  style?: ViewStyle;
}

const THUMB_SIZE = 30;
const TRACK_HEIGHT = 6;

function TickMark({
  index,
  sliderWidthSV,
  internalValue,
  min,
  max,
}: {
  index: number;
  sliderWidthSV: SharedValue<number>;
  internalValue: SharedValue<number>;
  min: number;
  max: number;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const tickLeft = (index / 10) * sliderWidthSV.value;
    const filledTrackWidth =
      THUMB_SIZE / 2 + ((internalValue.value - min) / (max - min)) * (sliderWidthSV.value - THUMB_SIZE);
    return {
      backgroundColor: tickLeft <= filledTrackWidth ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.3)',
    };
  });
  return <Animated.View style={[styles.tick, animatedStyle]} />;
}

export default function HapticSlider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  style,
}: HapticSliderProps) {
  const [sliderWidth, setSliderWidth] = useState(0);
  const internalValue = useSharedValue(value);
  const sliderWidthSV = useSharedValue(0);
  const thumbPosition = useSharedValue(0);
  const isActive = useSharedValue(false);
  const dragOffset = useSharedValue(0);

  useEffect(() => {
    if (sliderWidth === 0) return;
    const thumbRange = sliderWidth - THUMB_SIZE;
    thumbPosition.value = THUMB_SIZE / 2 + ((internalValue.value - min) / (max - min)) * thumbRange;
  }, [sliderWidth]);

  const handleValueChange = (steppedValue: number) => {
    onValueChange?.(steppedValue);
  };

  const pan = Gesture.Pan()
    .onStart((event) => {
      isActive.value = true;
      dragOffset.value = thumbPosition.value - (event.absoluteX - THUMB_SIZE / 2);
    })
    .onUpdate((event) => {
      const thumbMin = THUMB_SIZE / 2;
      const thumbMax = sliderWidthSV.value - THUMB_SIZE / 2;
      const thumbRange = sliderWidthSV.value - THUMB_SIZE;
      const newPosition = Math.max(thumbMin, Math.min(event.absoluteX - THUMB_SIZE / 2 + dragOffset.value, thumbMax));
      thumbPosition.value = newPosition;

      const percentage = (newPosition - thumbMin) / thumbRange;
      const newValue = min + percentage * (max - min);
      const steppedValue = Math.round(newValue / step) * step;
      internalValue.value = steppedValue;

      onValueChange?.(steppedValue);
    })
    .onFinalize(() => {
      isActive.value = false;
    });

  const tap = Gesture.Tap()
    .onStart((event) => {
      const thumbMin = THUMB_SIZE / 2;
      const thumbMax = sliderWidthSV.value - THUMB_SIZE / 2;
      const thumbRange = sliderWidthSV.value - THUMB_SIZE;
      const newPosition = Math.max(thumbMin, Math.min(event.absoluteX - THUMB_SIZE / 2, thumbMax));
      thumbPosition.value = withSpring(newPosition, {
        damping: 8,
        mass: 1,
        overshootClamping: true,
      });

      const percentage = (newPosition - thumbMin) / thumbRange;
      const newValue = min + percentage * (max - min);
      const steppedValue = Math.round(newValue / step) * step;
      internalValue.value = steppedValue;

      runOnJS(handleValueChange)(steppedValue);
    });

  const animatedThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbPosition.value - THUMB_SIZE / 2 }],
  }));

  const animatedFilledTrackStyle = useAnimatedStyle(() => ({
    width: THUMB_SIZE / 2 + ((internalValue.value - min) / (max - min)) * (sliderWidthSV.value - THUMB_SIZE),
  }));

  return (
    <GestureDetector gesture={Gesture.Exclusive(pan, tap)}>
      <View
        style={[styles.container, style]}
        onLayout={(event) => {
          const w = event.nativeEvent.layout.width - 10;
          setSliderWidth(w);
          sliderWidthSV.value = w;
        }}
      >
        {/* Track background */}
        <View style={[styles.track, { width: sliderWidth }]}>
          {/* Filled track */}
          <Animated.View style={[styles.filledTrack, animatedFilledTrackStyle]} />
        </View>

        {/* Tick marks */}
        <View style={[styles.tickContainer, { width: sliderWidth }]}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <TickMark
              key={i}
              index={i}
              sliderWidthSV={sliderWidthSV}
              internalValue={internalValue}
              min={min}
              max={max}
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
    backgroundColor: '#E0F0FA',
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
    backgroundColor: '#E0F0FA',
    borderWidth: 2,
    borderColor: 'rgba(100, 200, 255, 1)',
  },
});
