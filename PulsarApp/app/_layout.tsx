import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { isRunningInExpoGo } from 'expo';
import { Stack, useNavigationContainerRef, usePathname, useGlobalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Sentry from '@sentry/react-native';
import { useEffect, useRef } from 'react';
import 'react-native-reanimated';
import { PostHogProvider } from 'posthog-react-native';

import { Theme } from '@/constants/theme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { FilterProvider } from '@/contexts/FilterContext';
import { FavouritesProvider } from '@/contexts/FavouritesContext';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { PlaygroundProvider } from '@/contexts/PlaygroundContext';
import { StoreReviewProvider } from '@/contexts/StoreReviewContext';
import { posthog } from '@/src/config/posthog';
import { SENTRY_CONFIG } from '@/src/config/public';

SplashScreen.setOptions({
  duration: 300,
  fade: true,
});

const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: !isRunningInExpoGo(),
});

Sentry.init({
  dsn: SENTRY_CONFIG.dsn,
  tracesSampleRate: 1.0,
  integrations: [navigationIntegration],
  enableNativeFramesTracking: !isRunningInExpoGo(),
  enableTombstone: true,
});

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayout() {
  const navigationRef = useNavigationContainerRef();
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const previousPathname = useRef<string | undefined>(undefined);

  // SplashScreen.preventAutoHideAsync();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (navigationRef) {
      navigationIntegration.registerNavigationContainer(navigationRef);
    }
  }, [navigationRef]);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      posthog.screen(pathname, {
        previous_screen: previousPathname.current ?? null,
        ...params,
      });
      previousPathname.current = pathname;
    }
  }, [pathname, params]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PostHogProvider
        client={posthog}
        autocapture={{
          captureScreens: false, // Manual tracking with Expo Router
          captureTouches: true,
          propsToCapture: ['testID'],
          maxElementsCaptured: 20,
        }}
      >
        <StoreReviewProvider>
          <FilterProvider>
            <FavouritesProvider>
            <OnboardingProvider>
              <PlaygroundProvider>
                <ThemeProvider value={{...DefaultTheme, ...Theme}}>
                  <Stack>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="filtersModal" options={{ presentation: 'modal', title: 'Filters', headerShown: false }} />
                    <Stack.Screen name="tagsModal" options={{ presentation: 'modal', title: 'Tags', headerShown: false }} />
                    <Stack.Screen name="playgroundModal" options={{ presentation: 'modal', title: 'Playground', headerShown: false }} />
                    <Stack.Screen name="playgroundSettingsModal" options={{ presentation: 'modal', title: 'Playground settings', headerShown: false }} />
                  </Stack>
                  <StatusBar style="auto" />
                </ThemeProvider>
              </PlaygroundProvider>
            </OnboardingProvider>
            </FavouritesProvider>
          </FilterProvider>
        </StoreReviewProvider>
      </PostHogProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(RootLayout);
