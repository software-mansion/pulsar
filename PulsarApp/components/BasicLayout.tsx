import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  children?: React.ReactNode;
}

function BasicLayout({ children }: Props) {
  return (
    <View style={styles.container}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingLeft: 15,
    paddingRight: 15,
  },
});

export default BasicLayout;