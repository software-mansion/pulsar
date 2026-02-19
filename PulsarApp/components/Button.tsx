import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ViewProps } from 'react-native';
import Animated from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
const loaderIcon = require('../assets/images/loader.svg');
import { Image } from 'expo-image';

interface Props {
  label: string;
  style?: ViewProps['style'];
  onPress?: () => void;
  state?: 'loading' | 'default';
}

function Button({ label, style, onPress, state = 'default', ...props }: Props & ViewProps) {
  const [pressed, setPressed] = useState(false);
  const isLoading = state === 'loading';

  const tap = Gesture.Tap()
    .onStart(() => {
      setPressed(true);
      if (!isLoading) {
        onPress?.();
      }
    })
    .runOnJS(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPressed(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [pressed]);

  const containerStyle = [
    styles.container,
    isLoading ? styles.loadingContainer : null,
    style,
    pressed ? styles.pressAnimation : null
  ];

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={containerStyle} {...props}>
        {isLoading ? (
          <Animated.View style={styles.rotateAnimation}>
            <Image
              source={loaderIcon}
              style={styles.loader}
            />
          </Animated.View>
        ) : (
          <Text style={styles.text}>{label}</Text>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  containerTouchable: {
    alignSelf: 'flex-start',
  },
  container: {
    backgroundColor: 'white',
    boxShadow: '-3px 3px 0px #38ACDD',
    borderRadius: 4,
    paddingVertical: 18,
    paddingHorizontal: 10,
    borderColor: '#38ACDD',
    borderWidth: 2,
  },
  loadingContainer: {
    backgroundColor: '#B5E1F1',
    paddingVertical: 15,
  },
  loader: {
    width: 24,
    height: 24,
    alignSelf: 'center',
  },
  text: {
    textAlign: 'center',
    fontSize: 16,
    color: '#001A72',
  },
  pressAnimation: {
    animationDuration: 200,
    animationTimingFunction: 'ease-in',
    animationFillMode: 'forwards',
    animationName: {
      '0%': { 
        transform: [
          { translateX: 0 },
          { translateY: 0 }
        ],
        boxShadow: '-3px 3px 0px #38ACDD',
      },
      '50%': { 
        transform: [
          { translateX: -3 },
          { translateY: 3 }
        ],
        boxShadow: '0px 0px 0px #38ACDD',
      },
      '100%': { 
        transform: [
          { translateX: 0 },
          { translateY: 0 }
        ],
        boxShadow: '-3px 3px 0px #38ACDD',
       },
    },
  },
  rotateAnimation: {
    animationDuration: 2500,
    animationTimingFunction: 'linear',
    animationFillMode: 'forwards',
    animationIterationCount: 'infinite',
    animationName: {
      '0%': { 
        transform: [
          { rotate: '0deg' },
        ],
      },
      '100%': { 
        transform: [
          { rotate: '360deg' },
        ],
       },
    },
  },
});

export default Button;