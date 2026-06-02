import { useMemo, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { FIGMA_PREVIEW_URL } from '@/constants/Connection';
import { playPattern } from '@/src/haptics/playPattern';

// Screen behind pulsarapp://figma?token=<token>. Renders the live-preview web
// app inside a WebView and bridges its preset-tap events to real haptics on
// the device.
//
// The preview reads `?host=app` from its own URL to know it's running inside
// the native shell and should postMessage instead of using its in-page audio
// fallback (see figma/preview/src/App.tsx).
export default function FigmaScreen() {
  const params = useLocalSearchParams<{ token?: string }>();
  const router = useRouter();
  const token = typeof params.token === 'string' ? params.token : '';

  const previewUrl = useMemo(() => {
    // Strip any pre-existing query/hash so we don't accidentally double-append.
    const base = FIGMA_PREVIEW_URL.replace(/[?#].*$/, '');
    const search = new URLSearchParams({ host: 'app' });
    if (token) search.set('token', token);
    return `${base}?${search.toString()}`;
  }, [token]);

  const webRef = useRef<WebView>(null);

  const onMessage = (event: WebViewMessageEvent) => {
    // Messages from the embedded preview. Currently the only message we expect
    // is { type: 'play-preset', presetName: '...' } — anything else is ignored.
    try {
      const data = JSON.parse(event.nativeEvent.data) as {
        type?: string;
        presetName?: string;
      };
      if (data.type === 'play-preset' && typeof data.presetName === 'string') {
        playPattern(data.presetName);
      }
    } catch {
      // Non-JSON messages aren't ours; swallow.
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Figma',
          headerBackTitle: 'Back',
          headerBackVisible: router.canGoBack()
        }}
      />
      {token ? (
        <WebView
          ref={webRef}
          source={{ uri: previewUrl }}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          onMessage={onMessage}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loader}>
              <ActivityIndicator />
            </View>
          )}
          style={styles.webview}
        />
      ) : (
        <View style={styles.loader}>
          <ActivityIndicator />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  webview: { flex: 1 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' }
});
