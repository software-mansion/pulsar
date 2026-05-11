import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ViewProps, Dimensions, type ViewStyle, type StyleProp } from 'react-native';
import Animated from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Presets } from 'react-native-pulsar';
import { Icon, IconName } from './Icon';

const { width } = Dimensions.get('window');

interface Props {
  label?: string;
  style?: ViewProps['style'];
  iconStyle?: StyleProp<ViewStyle>;
  onClick?: () => void;
  onComplete?: () => void;
  state?: 'loading' | 'default';
  showIcon?: 'arrow' | 'play' | 'stop' | 'download' | 'record' | 'square' | 'none';
  largeIcon?: boolean;
  fullWidth?: boolean;
  enabled?: boolean;
  disableHaptics?: boolean;
}

type ButtonIconName = Extract<IconName, 'arrow' | 'play' | 'stop' | 'download' | 'record' | 'square'>;

function Button({
  label,
  style,
  iconStyle,
  onClick,
  onComplete,
  state = 'default',
  showIcon = 'none',
  largeIcon = false,
  fullWidth = false,
  enabled = true,
  disableHaptics = false,
  ...props }: Props & ViewProps) {
  const [pressed, setPressed] = useState(false);
  const isLoading = state === 'loading';

  const tap = Gesture.Tap()
    .onBegin(() => {
      setPressed(true);
      if (!isLoading && enabled) {
        if (!disableHaptics) Presets.chip();
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
  }, [enabled, isLoading, onComplete, pressed]);

  const iconSize = largeIcon ? 22 : 18;
  const iconWrapperStyle = largeIcon ? styles.largeArrowIcon : styles.arrowIcon;
  const buttonIconColor = showIcon === 'record' ? '#FF6259' : '#001A72';

  const renderIcon = showIcon === 'none' ? null : (
    <View style={[iconWrapperStyle, iconStyle]}>
      <Icon name={showIcon as ButtonIconName} size={iconSize} color={buttonIconColor} />
    </View>
  );

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
          <Animated.View style={[styles.rotateAnimation, styles.loader]}>
            <Icon name="loader" size={24} color="#001A72" />
          </Animated.View>
        ) : (
          <View style={[largeIcon ? styles.largeIconRow : styles.row, !enabled && styles.disabled]}>
            {label && <Text style={styles.text}>{label}</Text>}
            {renderIcon}
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
