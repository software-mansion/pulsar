/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#001A72';
const tintColorDark = '#fff';

export const Theme = {
  dark: false,
  colors: {
    primary: '#001A72',
    background: '#e1f3fa',
    card: 'rgb(255, 255, 255)',
    text: '#2B85AB',
    border: 'rgb(216, 216, 216)',
    notification: 'rgb(255, 59, 48)',
  },
}

export const Colors = {
  light: {
    text: '#001A72',
    background: '#fff',
    tint: tintColorLight,
    icon: '#001A72',
    tabIconDefault: '#B5E1F1',
    tabIconSelected: tintColorLight,
    borderColor: '#38ACDD',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#001A72',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    borderColor: '#38ACDD',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** DM Sans font */
    sans: 'DMSans',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'DMSans',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "'DM Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
