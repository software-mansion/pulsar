import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ViewProps } from 'react-native';
import Animated from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
const loaderIcon = require('../assets/images/loader.svg');
import { Image } from 'expo-image';

const arrowIcon = require('@/assets/images/arrow.svg');
const playIcon = require('@/assets/images/play.svg');
const stopIcon = require('@/assets/images/stop.svg');

interface Props {
  label: string;
  style?: ViewProps['style'];
  onClick?: () => void;
  onComplete?: () => void;
  state?: 'loading' | 'default';
  showIcon?: 'arrow' | 'play' | 'stop' | 'none';
}

function Button({ label, style, onClick, onComplete, state = 'default', showIcon = 'none', ...props }: Props & ViewProps) {
  const [pressed, setPressed] = useState(false);
  const isLoading = state === 'loading';

  const tap = Gesture.Tap()
    .onStart(() => {
      setPressed(true);
      if (!isLoading) {
        onClick?.();
      }
    })
    .runOnJS(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPressed(false);
      if (pressed && !isLoading) {
        onComplete?.();
      }
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
          <View style={styles.row}>
            <Text style={styles.text}>{label}</Text>
            {showIcon === 'arrow' && <Image source={arrowIcon} style={styles.arrowIcon} />}
            {showIcon === 'play' && <Image source={playIcon} style={styles.arrowIcon} />}
            {showIcon === 'stop' && <Image source={stopIcon} style={styles.arrowIcon} />}
          </View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
    fontSize: 16,
    color: '#001A72',
  },
  arrowIcon: {
    width: 18,
    height: 18,
    marginLeft: 5,
    alignSelf: 'center',
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