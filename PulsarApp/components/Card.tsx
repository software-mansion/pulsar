import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

interface Props {
  children?: React.ReactNode;
  enableAnimation?: boolean;
}

function Card({ children, style, enableAnimation = true }: Props & { style?: React.ComponentProps<typeof Animated.View>['style'] }) {
  const [applyAnimation, setApplyAnimation] = useState(false);

  useEffect(() => {
    if (enableAnimation) {
      setTimeout(() => {
        setApplyAnimation(true);
      }, 1000);
    }
  }, [enableAnimation]);

  return (
    <Animated.View
      style={[styles.container, style]}
      layout={applyAnimation ? LinearTransition : undefined}
      entering={applyAnimation ? FadeIn : undefined}
      exiting={applyAnimation ? FadeOut : undefined}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    boxShadow: '-3px 3px 0px #38ACDD',
    borderRadius: 4,
    padding: 15,
    paddingVertical: 25,
    borderColor: '#38ACDD',
    borderWidth: 2,
    overflow: 'hidden',
  },
});

export default Card;