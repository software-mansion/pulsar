import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';

interface Props {
  index: number,
  children?: React.ReactNode;
}

function Point({ index, children }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.flex}>
        <ThemedText style={styles.point}>{index}</ThemedText>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  flex: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    maxWidth: '88%',
  },
  point: {
    backgroundColor: '#B5E1F1',
    textAlign: 'center',
    paddingHorizontal: 11,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 10,
    fontSize: 18,
  },
});

export default Point;