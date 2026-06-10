import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Icon, IconName } from './Icon';

interface SvgIconProps {
  iconName: Extract<IconName, 'home' | 'list' | 'brush' | 'sparkles' | 'figma'>;
  state?: 'active' | 'default';
  size?: number;
}

const SvgIcon: React.FC<SvgIconProps> = ({
  iconName,
  state = 'default',
  size = 24,
}) => {
  const iconColor = state === 'active' ? '#001A72' : '#2B85AB';

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Icon name={iconName} size={size} color={iconColor} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SvgIcon;
