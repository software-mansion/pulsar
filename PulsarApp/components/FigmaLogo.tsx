import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Icon } from './Icon';

/**
 * The official Figma logo, rendered from the `figma` nano-icon glyph.
 *
 * Figma's brand guidelines require the mark to be used unaltered: original
 * colours, original proportions, no tinting or effects. This component exists
 * to enforce that — it renders `<Icon name="figma" />` with no `color` prop, so
 * nano-icons falls back to the per-layer colours baked into the glyphmap from
 * `assets/icons/pulsar-icons/figma.svg`. Use it instead of `SvgIcon`, which
 * tints its glyph by state.
 *
 * The glyph is 2:3, and nano-icons derives width from the advance, so `size` is
 * the logo's height. The square wrapper keeps it aligned with the 24×24 icons
 * it sits next to in the tab bar.
 */
const FigmaLogo: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <View style={[styles.container, { width: size, height: size }]}>
    <Icon name="figma" size={size} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FigmaLogo;
