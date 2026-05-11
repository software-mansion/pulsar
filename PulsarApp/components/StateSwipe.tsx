import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { Icon } from './Icon';

const handImage = require('@/assets/images/hand.png');

const GLOBAL_DELAY = 1000;

export function StateSwipe({ children }: { children?: React.ReactNode }) {
  return (
    <Animated.View style={[styles.container]} entering={FadeIn} exiting={FadeOut}>
      {children}

      <Text style={styles.label}>Swipe to play continuous haptics</Text>

      <View style={styles.circlesContainer} pointerEvents="none">
        <Animated.View style={[styles.circleAnimation, styles.circle]}>
          <Icon name="ellipse" size={60} />
        </Animated.View>
        <Animated.View style={[styles.circleAnimation, styles.circle]}>
          <Icon name="ellipse" size={90} />
        </Animated.View>
        <Animated.View style={[styles.circleAnimation, styles.circle]}>
          <Icon name="ellipse" size={120} />
        </Animated.View>
        <Animated.View style={[styles.circleAnimation, styles.circle]}>
          <Icon name="ellipse" size={150} />
        </Animated.View>
        <Animated.View style={[styles.circleAnimation, styles.circle]}>
          <Icon name="ellipse" size={180} />
        </Animated.View>
      </View>

      <Animated.View style={[styles.handWrapper, styles.handAnimation]} pointerEvents="none">
        <Image source={handImage} style={styles.hand} contentFit="contain" />
      </Animated.View>

    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#001A72',
    backgroundColor: 'white',
    borderRadius: 4,
    paddingVertical: 18,
    paddingHorizontal: 10,
    borderColor: '#38ACDD',
    borderWidth: 2,
    boxShadow: '-3px 3px 0px #38ACDD',
  },
  circlesContainer: {
    position: 'absolute',
    left: '37%',
    bottom: '38%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
  },
  circleAnimation: {
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,

    animationDelay: GLOBAL_DELAY,
    animationDuration: 2000,
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease-out',
    animationName: {
      0: {
        transform: [{ translateX: 0 }, { translateY: 0 }],
        opacity: 0,
      },
      0.1: {
        transform: [{ translateX: 0 }, { translateY: 0 }],
        opacity: 1,
      },
      0.8: {
        transform: [{ translateX: 80 }, { translateY: -200 }],
        opacity: 1,
      },
      1: {
        transform: [{ translateX: 80 }, { translateY: -200 }],
        opacity: 0,
      },
    },
  },

  handWrapper: {
    position: 'absolute',
    left: '30%',
    bottom: '30%',
  },
  hand: {
    width: 60,
    height: 60,
  },
  handAnimation: {
    animationDelay: GLOBAL_DELAY,
    animationDuration: 2000,
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease-out',
    animationName: {
      0: {
        transform: [{ translateX: 0 }, { translateY: 0 }, { scale: 1 }],
        opacity: 1,
      },
      0.1: {
        transform: [{ translateX: 0 }, { translateY: 0 }, { scale: 0.8 }],
        opacity: 0.8,
      },
      0.8: {
        transform: [{ translateX: 80 }, { translateY: -200 }, { scale: 0.8 }],
        opacity: 0.8,
      },
      0.9: {
        transform: [{ translateX: 80 }, { translateY: -200 }, { scale: 1 }],
        opacity: 1,
      },
      1: {
        transform: [{ translateX: 0 }, { translateY: 0 }, { scale: 1 }],
        opacity: 1,
      },
    },
  },
});
