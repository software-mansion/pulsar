import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';

// Figma-style geometric mark, rendered single-color so it sits cleanly next
// to the other monochrome tab icons (home / list / brush / sparkles). The
// nano-icon font has no Figma glyph, so this component fills the gap with
// react-native-svg using the same active/default tint as SvgIcon.
interface FigmaTabIconProps {
  state?: 'active' | 'default';
  size?: number;
}

const FigmaTabIcon: React.FC<FigmaTabIconProps> = ({ state = 'default', size = 24 }) => {
  const color = state === 'active' ? '#001A72' : '#2B85AB';
  const strokeWidth = 1.8;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Top-left rectangle */}
        <Rect
          x={7}
          y={2}
          width={5}
          height={6}
          rx={2.5}
          stroke={color}
          strokeWidth={strokeWidth}
        />
        {/* Middle-left rectangle */}
        <Rect
          x={7}
          y={9}
          width={5}
          height={6}
          rx={2.5}
          stroke={color}
          strokeWidth={strokeWidth}
        />
        {/* Bottom-left rectangle */}
        <Rect
          x={2}
          y={16}
          width={5}
          height={6}
          rx={2.5}
          stroke={color}
          strokeWidth={strokeWidth}
        />
        {/* Top-right circle */}
        <Circle cx={15.5} cy={5} r={3} stroke={color} strokeWidth={strokeWidth} />
        {/* Middle-right circle */}
        <Circle cx={15.5} cy={12} r={3} stroke={color} strokeWidth={strokeWidth} />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FigmaTabIcon;
