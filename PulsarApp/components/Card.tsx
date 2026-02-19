import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';

interface Props {
  children?: React.ReactNode;
}

function Card({ children }: Props) {
  const [applyAnimation, setApplyAnimation] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setApplyAnimation(true);
    }, 1000);
  }, []);

  return (
    <Animated.View style={styles.container} layout={applyAnimation ? LinearTransition : undefined}>
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