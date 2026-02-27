import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { ThemedText } from './themed-text';
import Animated from 'react-native-reanimated';

interface Props {
  status: 'connected' | 'disconnected' | 'waiting';
}

function ConnectionIndicator({ status, ...rest }: Props & ViewProps) {
  return (
    <View {...rest}>
      <View style={styles.container}>
        <ThemedText style={styles.text}>{statusToText[status]}</ThemedText>
        <Animated.View style={[styles.indicator, statusToColor[status], status === 'connected' ? styles.pulseAnimation : null]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 50,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderColor: '#38ACDD',
    borderWidth: 2,
    alignSelf: 'flex-start',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  text: {
    fontSize: 16,
    marginRight: 10,
  },
  indicator: {
    width: 18,
    height: 18,
    borderRadius: '100%',
  },
  pulseAnimation: {
    animationDuration: 1500,
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
    animationName: {
      '0%':   { boxShadow: '0px 0px 0px 0px rgba(87, 180, 149, 0.8)' },
      '100%': { boxShadow: '0px 0px 0px 5px rgba(87, 180, 149, 0)' },
    },
  },
  red: {
    backgroundColor: '#FF6259'
  },
  green: {
    backgroundColor: '#57B495',
  },
  neutral: {
    backgroundColor: '#E1F3FA',
  },
});

const statusToText = {
  connected: 'Connected',
  disconnected: 'Not connected',
  waiting: 'Waiting',
}

const statusToColor = {
  connected: styles.green,
  disconnected: styles.red,
  waiting: styles.neutral,
}

export default ConnectionIndicator;