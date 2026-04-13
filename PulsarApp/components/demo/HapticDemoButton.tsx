import React, { useEffect, useState } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { StyleSheet, Text, ViewProps } from 'react-native';

interface HapticDemoButtonProps {
  label: string;
  onPress: () => void;
  style?: ViewProps['style'];
}

export default function HapticDemoButton({ label, onPress, style }: HapticDemoButtonProps) {
  const [pressed, setPressed] = useState(false);

  const tap = Gesture.Tap()
    .onBegin(() => {
      setPressed(true);
      onPress();
    })
    .runOnJS(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPressed(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [pressed]);

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={[styles.button, pressed ? styles.pressAnimation : null, style]}>
        <Text style={styles.label}>{label}</Text>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'white',
    borderColor: '#38ACDD',
    borderWidth: 2,
    borderRadius: 4,
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '-3px 3px 0px #38ACDD',
  },
  pressAnimation: {
    animationDuration: 200,
    animationTimingFunction: 'ease-in',
    animationFillMode: 'forwards',
    animationName: {
      '0%': {
        transform: [
          { translateX: 0 },
          { translateY: 0 },
        ],
        boxShadow: '-3px 3px 0px #38ACDD',
      },
      '50%': {
        transform: [
          { translateX: -3 },
          { translateY: 3 },
        ],
        boxShadow: '0px 0px 0px #38ACDD',
      },
      '100%': {
        transform: [
          { translateX: 0 },
          { translateY: 0 },
        ],
        boxShadow: '-3px 3px 0px #38ACDD',
      },
    },
  },
  label: {
    fontSize: 15,
    color: '#001A72',
    textAlign: 'center',
  },
});