import * as Font from 'expo-font';

export const useFonts = async () => {
  try {
    await Font.loadAsync({
      // Load DM Sans from Google Fonts CDN via expo-font
      'DMSans': require('../assets/fonts/DMSans-Regular.ttf'),
      'DMSans-Bold': require('../assets/fonts/DMSans-Bold.ttf'),
      'DMSans-Italic': require('../assets/fonts/DMSans-Italic.ttf'),
      'DMSans-BoldItalic': require('../assets/fonts/DMSans-BoldItalic.ttf'),
    });
  } catch (error) {
    console.error('Error loading fonts:', error);
  }
};

export default useFonts;
