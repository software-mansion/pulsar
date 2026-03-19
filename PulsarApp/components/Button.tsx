import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ViewProps, Dimensions } from 'react-native';
import Animated from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
const loaderIcon = require('../assets/images/loader.svg');
import { Image } from 'expo-image';

const arrowIcon = require('@/assets/images/arrow.svg');
const playIcon = require('@/assets/images/play.svg');
const stopIcon = require('@/assets/images/stop.svg');
const downloadIcon = require('@/assets/images/download.svg');
const recordIcon = require('@/assets/images/record.svg');
const squareIcon = require('@/assets/images/square.svg');

const { width } = Dimensions.get('window');

interface Props {
  label?: string;
  style?: ViewProps['style'];
  onClick?: () => void;
  onComplete?: () => void;
  state?: 'loading' | 'default';
  showIcon?: 'arrow' | 'play' | 'stop' | 'download' | 'record' | 'square' | 'none';
  largeIcon?: boolean;
  fullWidth?: boolean;
  enabled?: boolean;
}

function Button({
  label,
  style,
  onClick,
  onComplete,
  state = 'default',
  showIcon = 'none',
  largeIcon = false,
  fullWidth = false,
  enabled = true,
  ...props }: Props & ViewProps) {
  const [pressed, setPressed] = useState(false);
  const isLoading = state === 'loading';

  const tap = Gesture.Tap()
    .onBegin(() => {
      setPressed(true);
      if (!isLoading && enabled) {
        onClick?.();
      }
    }).runOnJS(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPressed(false);
      if (pressed && !isLoading && enabled) {
        onComplete?.();
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [pressed]);

  const containerStyle = [
    styles.container,
    isLoading ? styles.loadingContainer : null,
    style,
    enabled && (pressed ? showIcon === 'record' || showIcon === 'square' ? styles.pressAnimationRecord : styles.pressAnimation : null),
    showIcon === 'record' || showIcon === 'square' ? { width: width - 200, borderColor: '#FF6259', boxShadow: '-3px 3px 0px #FF6259' } : null,
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
          <View style={[largeIcon ? styles.largeIconRow : styles.row, !enabled && styles.disabled]}>
            {label && <Text style={styles.text}>{label}</Text>}
            {showIcon === 'arrow' && <Image source={arrowIcon} style={largeIcon ? styles.largeArrowIcon : styles.arrowIcon} />}
            {showIcon === 'play' && <Image source={playIcon} style={largeIcon ? styles.largeArrowIcon : styles.arrowIcon} />}
            {showIcon === 'stop' && <Image source={stopIcon} style={largeIcon ? styles.largeArrowIcon : styles.arrowIcon} />}
            {showIcon === 'download' && <Image source={downloadIcon} style={largeIcon ? styles.largeArrowIcon : styles.arrowIcon} />}
            {showIcon === 'record' && <Image source={recordIcon} style={largeIcon ? styles.largeArrowIcon : styles.arrowIcon} />}
            {showIcon === 'square' && <Image source={squareIcon} style={largeIcon ? styles.largeArrowIcon : styles.arrowIcon} />}
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    boxShadow: '-3px 3px 0px #38ACDD',
    borderRadius: 4,
    paddingVertical: 18,
    paddingHorizontal: 10,
    borderColor: '#38ACDD',
    borderWidth: 2,
    justifyContent: 'center',
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
  largeArrowIcon: {
    width: 22,
    height: 22,
    alignSelf: 'center',
  },
  largeIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
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
  pressAnimationRecord: {
    animationDuration: 200,
    animationTimingFunction: 'ease-in',
    animationFillMode: 'forwards',
    animationName: {
      '0%': { 
        transform: [
          { translateX: 0 },
          { translateY: 0 }
        ],
        boxShadow: '-3px 3px 0px #FF6259',
      },
      '50%': { 
        transform: [
          { translateX: -3 },
          { translateY: 3 }
        ],
        boxShadow: '0px 0px 0px #FF6259',
      },
      '100%': { 
        transform: [
          { translateX: 0 },
          { translateY: 0 }
        ],
        boxShadow: '-3px 3px 0px #FF6259',
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
  disabled: {
    opacity: 0.5,
  },
});

export default Button;