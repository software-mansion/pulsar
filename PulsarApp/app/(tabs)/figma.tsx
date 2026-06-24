import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import type { Pattern } from 'react-native-pulsar';

import { FIGMA_PREVIEW_URL } from '@/constants/Connection';
import { useConnections } from '@/contexts/ConnectionsContext';
import { usePlayPatternFromHost } from '@/src/haptics/playPattern';
import { ThemedText } from '@/components/themed-text';
import BasicLayout from '@/components/BasicLayout';
import Card from '@/components/Card';
import Point from '@/components/Point';
import Input from '@/components/Input';
import Button from '@/components/Button';
import SvgIcon from '@/components/SvgIcon';
import { Margins } from '@/constants/theme';

const defaultEdges = {
  top: 'additive',
  left: 'additive',
  bottom: 'off',
  right: 'additive',
};

const fullscreenEdges = {
  top: 'off',
  left: 'off',
  bottom: 'off',
  right: 'off',
};

// Build a script that delivers a live haptics-config update into the preview.
// The preview runs either at the top level (local dev) or inside an <iframe
// srcdoc> (the production docs embed), so we post to the top document AND to
// every child iframe's contentWindow — same-origin (the srcdoc inherits our
// origin), so the post is allowed.
function buildPreviewInjection(envelope: unknown): string {
  // JSON is a valid JS expression on the ES2019+ engines these WebViews use
  // (U+2028/U+2029 are legal in string literals), so embed it directly.
  const json = JSON.stringify(envelope);
  return (
    `(function(){try{var u=${json};` +
    `window.postMessage(u,'*');` +
    `var f=document.querySelectorAll('iframe');` +
    `for(var i=0;i<f.length;i++){try{f[i].contentWindow&&f[i].contentWindow.postMessage(u,'*');}catch(e){}}` +
    `}catch(e){}})();true;`
  );
}

// Figma tab. Two modes:
//   1. Deep-linked from the Figma plugin (`pulsarapp://figma?token=<token>`)
//      → render the standalone live-preview web app inside a WebView and bridge
//        its preset-tap events to native haptics.
//   2. Opened manually via the tab bar (no token) → render a short explainer
//      describing what Figma Live Preview is and how to connect a design file.
export default function FigmaScreen() {
  const params = useLocalSearchParams<{ token?: string }>();
  const paramToken = typeof params.token === 'string' ? params.token : '';
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
  const { lastPreviewUpdate } = useConnections();

  // Deliver live haptics-config updates relayed by the plugin into the preview.
  // Seed the handled nonce at mount so an update that arrived before this
  // preview opened doesn't fire on first render; only newer ones inject.
  const handledNonceRef = useRef<number | null>(lastPreviewUpdate?.nonce ?? null);
  useEffect(() => {
    const update = lastPreviewUpdate;
    if (!update || handledNonceRef.current === update.nonce) return;
    handledNonceRef.current = update.nonce;
    // Ignore updates targeting a different preview than the one we're showing.
    if (update.previewToken && update.previewToken !== token) return;
    webRef.current?.injectJavaScript(
      buildPreviewInjection({
        type: 'pulsar-haptics-update',
        kind: update.kind,
        fromRevision: update.fromRevision,
        toRevision: update.toRevision,
        diff: update.diff,
      })
    );
  }, [lastPreviewUpdate, token]);

  const [tabBarHidden, setTabBarHidden] = useState(false);
  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: tabBarHidden ? { display: 'none' } : undefined,
    });
    return () => navigation.setOptions({ tabBarStyle: undefined });
  }, [navigation, tabBarHidden]);

  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
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
    <SafeAreaView edges={(tabBarHidden ? fullscreenEdges : defaultEdges) as any} style={styles.safeArea}>
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
    </SafeAreaView>
  );
}

function FigmaExplainer({ onConnect }: { onConnect: (token: string) => void }) {
  const [manualToken, setManualToken] = useState('');
  const canConnect = manualToken.trim().length > 0;

  return (
    <SafeAreaView edges={defaultEdges as any} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <BasicLayout>
          <View style={styles.titleContainer}>
            <ThemedText type="title">Figma Live Preview</ThemedText>
            <SvgIcon iconName="figma" state="active" size={42} />
          </View>

          <ThemedText style={Margins.marginTop2X}>
            Connect a Figma design to your phone and feel haptics when
            you tap on a component in the prototype preview.
          </ThemedText>

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
                Open the plugin's <ThemedText type="defaultSemiBold">Live preview</ThemedText> tab
                and tap <ThemedText type="defaultSemiBold">Show QR code</ThemedText>.
              </ThemedText>
            </Point>
            <Point index={4}>
              <ThemedText>
                Scan the QR code (or paste the token above) - PulsarApp opens
                straight on this screen with the preview loaded.
              </ThemedText>
            </Point>
          </Card>

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

        </BasicLayout>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
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
