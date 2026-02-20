import React from 'react';
import { Image, ImageProps } from 'expo-image';
import { View, StyleSheet } from 'react-native';

const ICON_SOURCES = {
  home: require('@/assets/images/home.svg'),
  list: require('@/assets/images/list.svg'),
  brush: require('@/assets/images/brush.svg'),
  sparkles: require('@/assets/images/sparkles.svg'),
} as const;

type IconName = keyof typeof ICON_SOURCES;

interface SvgIconProps extends Omit<ImageProps, 'source'> {
  iconName: IconName;
  state?: 'active' | 'default';
  size?: number;
}

const SvgIcon: React.FC<SvgIconProps> = ({ 
  iconName, 
  state = 'default', 
  size = 24,
  style,
  ...props 
}) => {  
  const iconColor = state === 'active' ? '#001A72' : '#2B85AB';
  const iconSource = ICON_SOURCES[iconName];

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={iconSource}
        style={[
          { width: size, height: size },
          { tintColor: iconColor },
          style,
        ]}
        {...props}
      />
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
