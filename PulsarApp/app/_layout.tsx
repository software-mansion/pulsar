import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { isRunningInExpoGo } from 'expo';
import { Stack, useNavigationContainerRef } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Sentry from '@sentry/react-native';
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

const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: !isRunningInExpoGo(),
});

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || undefined,
  tracesSampleRate: 1.0,
  integrations: [navigationIntegration],
  enableNativeFramesTracking: !isRunningInExpoGo(),
});

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayout() {
  const colorScheme = useColorScheme();
  const navigationRef = useNavigationContainerRef();

  // SplashScreen.preventAutoHideAsync();
  
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (navigationRef) {
      navigationIntegration.registerNavigationContainer(navigationRef);
    }
  }, [navigationRef]);

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

export default Sentry.wrap(RootLayout);
