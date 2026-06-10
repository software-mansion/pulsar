import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import type { Pattern } from 'react-native-pulsar';

import { FIGMA_PREVIEW_URL } from '@/constants/Connection';
import { usePlayPatternFromHost } from '@/src/haptics/playPattern';
import { ThemedText } from '@/components/themed-text';
import BasicLayout from '@/components/BasicLayout';
import Card from '@/components/Card';
import Point from '@/components/Point';
import Input from '@/components/Input';
import Button from '@/components/Button';
import SvgIcon from '@/components/SvgIcon';
import { Margins } from '@/constants/theme';

// Figma tab. Two modes:
//   1. Deep-linked from the Figma plugin (`pulsarapp://figma?token=<token>`)
//      → render the standalone live-preview web app inside a WebView and bridge
//        its preset-tap events to native haptics.
//   2. Opened manually via the tab bar (no token) → render a short explainer
//      describing what Figma Live Preview is and how to connect a design file.
//
// The preview reads `?host=app` from its own URL to know it's running inside
// the native shell and should postMessage instead of using its in-page audio
// fallback (see figma/preview/src/App.tsx).
export default function FigmaScreen() {
  const params = useLocalSearchParams<{ token?: string }>();
  const paramToken = typeof params.token === 'string' ? params.token : '';
  // Token typed/pasted into the explainer screen. Lifted here so a manual
  // connect survives mode-switches between explainer and WebView, and so the
  // explainer can ask us to "connect" without owning the navigation logic.
  const [enteredToken, setEnteredToken] = useState('');
  const token = paramToken || enteredToken;

  if (token) {
    return <FigmaPreviewWebView token={token} />;
  }
  return <FigmaExplainer onConnect={(t) => setEnteredToken(t.trim())} />;
}

function FigmaPreviewWebView({ token }: { token: string }) {
  const previewUrl = useMemo(() => {
    // Strip any pre-existing query/hash so we don't accidentally double-append.
    const base = FIGMA_PREVIEW_URL.replace(/[?#].*$/, '');
    const search = new URLSearchParams({ host: 'app', token });
    return `${base}?${search.toString()}`;
  }, [token]);

  const webRef = useRef<WebView>(null);
  const playFromHost = usePlayPatternFromHost();
  const navigation = useNavigation();

  // The preview can ask us to hide the bottom tab bar so the prototype runs
  // edge-to-edge ("true full screen"). We drive it through state + setOptions so
  // it's declarative and self-restores: leaving the screen with the bar hidden
  // resets it via the cleanup below.
  const [tabBarHidden, setTabBarHidden] = useState(false);
  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: tabBarHidden ? { display: 'none' } : undefined,
    });
    return () => navigation.setOptions({ tabBarStyle: undefined });
  }, [navigation, tabBarHidden]);

  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      // Messages from the embedded preview:
      //   { type: 'play-preset', presetName: '...', pattern?: Pattern }
      //     - Built-in presets (TickTock, DogBark, …) resolve by name via
      //       react-native-pulsar's Presets and play the tuned haptic.
      //     - Custom presets won't match a name, so we fall back to
      //       PatternComposer.parse() + .play() on the carried pattern.
      //   { type: 'set-tab-bar-hidden', hidden: boolean }
      //     - Toggles the bottom tab bar for the full-screen preview.
      try {
        const data = JSON.parse(event.nativeEvent.data) as {
          type?: string;
          presetName?: string;
          pattern?: Pattern;
          hidden?: boolean;
        };
        if (data.type === 'play-preset' && typeof data.presetName === 'string') {
          playFromHost(data.presetName, data.pattern);
        } else if (data.type === 'set-tab-bar-hidden' && typeof data.hidden === 'boolean') {
          setTabBarHidden(data.hidden);
        }
      } catch {
        // Non-JSON messages aren't ours; swallow.
      }
    },
    [playFromHost]
  );

  return (
    <WebView
      ref={webRef}
      // source={{ uri: previewUrl }}
      source={{ uri: "http://169.254.109.67:5173/?token=f8bceab464a398a68b3f9cb43e79ea9c5a005acedc6b5c88c9898fbabbd0968c" }}
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
  );
}

function FigmaExplainer({ onConnect }: { onConnect: (token: string) => void }) {
  const [manualToken, setManualToken] = useState('');
  const canConnect = manualToken.trim().length > 0;

  return (
    <SafeAreaView>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <BasicLayout>
          <View style={styles.titleContainer}>
            <ThemedText type="title">Figma Live Preview</ThemedText>
            <SvgIcon iconName="figma" state="active" size={42} />
          </View>

          <ThemedText style={Margins.marginTop2X}>
            Connect a Figma design to your phone and feel the bound haptics when
            you tap on a component in the prototype preview — perfect for
            reviewing UX before writing any code.
          </ThemedText>

          <Card style={Margins.marginTop4X}>
            <ThemedText type="subtitle">Connect with a token</ThemedText>
            <ThemedText style={Margins.marginTop2X}>
              Already have a share token from the Figma plugin? Paste it here
              to open the preview without scanning the QR code.
            </ThemedText>
            <Input
              placeholder="Paste preview token"
              style={Margins.marginTop3X}
              value={manualToken}
              onChangeText={setManualToken}
              keyboardType="default"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              spellCheck={false}
            />
            <Button
              label="Connect"
              style={Margins.marginTop3X}
              enabled={canConnect}
              onClick={() => {
                if (canConnect) onConnect(manualToken);
              }}
            />
          </Card>

          <Card style={Margins.marginTop4X}>
            <ThemedText type="subtitle">How to connect Figma</ThemedText>
            <Point index={1}>
              <ThemedText>
                Install the <ThemedText type="defaultSemiBold">Pulsar</ThemedText> plugin from the
                Figma Community and run it on the design file you want to preview.
              </ThemedText>
            </Point>
            <Point index={2}>
              <ThemedText>
                Select a component, pick a haptic preset and bind it. Repeat for
                every element you want to feel in the prototype.
              </ThemedText>
            </Point>
            <Point index={3}>
              <ThemedText>
                Open the plugin&apos;s <ThemedText type="defaultSemiBold">Live preview</ThemedText> tab
                and tap <ThemedText type="defaultSemiBold">Show QR code</ThemedText>.
              </ThemedText>
            </Point>
            <Point index={4}>
              <ThemedText>
                Scan the QR code with your phone&apos;s camera — PulsarApp opens
                straight on this screen and starts playing the bound haptics as
                you tap components in the preview.
              </ThemedText>
            </Point>
          </Card>

          <Card style={Margins.marginTop4X}>
            <ThemedText type="subtitle">Good to know</ThemedText>
            <ThemedText style={Margins.marginTop2X}>
              You don&apos;t need to pair the phone separately for Figma Live
              Preview — the QR code (or the token above) carries everything
              PulsarApp needs to fetch the design and play the right pattern
              when you tap an element.
            </ThemedText>
          </Card>
        </BasicLayout>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  webContainer: { flex: 1, backgroundColor: '#fff' },
  webview: { flex: 1 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingBottom: 40 },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 10,
  },
});
