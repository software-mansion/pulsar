import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Theme } from '@/constants/theme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { FilterProvider } from '@/contexts/FilterContext';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { StoreReviewProvider } from '@/contexts/StoreReviewContext';

SplashScreen.setOptions({
  duration: 300,
  fade: true,
});

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // SplashScreen.preventAutoHideAsync();
  
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StoreReviewProvider>
        <FilterProvider>
          <OnboardingProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : {...DefaultTheme, ...Theme}}>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="filtersModal" options={{ presentation: 'modal', title: 'Filters', headerShown: false }} />
                <Stack.Screen name="tagsModal" options={{ presentation: 'modal', title: 'Tags', headerShown: false }} />
                <Stack.Screen name="playgroundModal" options={{ presentation: 'modal', title: 'Playground', headerShown: false }} />
              </Stack>
              <StatusBar style="auto" />
            </ThemeProvider>
          </OnboardingProvider>
        </FilterProvider>
      </StoreReviewProvider>
    </GestureHandlerRootView>
  );
}
