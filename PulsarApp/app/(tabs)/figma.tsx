import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import type { Pattern } from 'react-native-pulsar';

import { FIGMA_PREVIEW_URL } from '@/constants/Connection';
import { connectionType, useConnections } from '@/contexts/ConnectionsContext';
import { usePlayPatternFromHost } from '@/src/haptics/playPattern';
import { ThemedText } from '@/components/themed-text';
import { Icon } from '@/components/Icon';
import BasicLayout from '@/components/BasicLayout';
import Card from '@/components/Card';
import Point from '@/components/Point';
import SvgIcon from '@/components/SvgIcon';
import ConnectionList from '@/components/home/ConnectionList';
import NowPlayingToast from '@/components/NowPlayingToast';
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
  const token = typeof params.token === 'string' ? params.token : '';

  // The "preset received" banner overlays both modes (live preview + explainer),
  // so a preset played from the plugin is visible while the user sits on the
  // Figma screen too - not only on the home tab.
  return (
    <View style={styles.screen}>
      {token ? <FigmaPreviewWebView token={token} /> : <FigmaExplainer />}
      <NowPlayingToast />
    </View>
  );
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
  const router = useRouter();
  const { lastPreviewUpdate } = useConnections();

  // Manage the loading overlay ourselves instead of the WebView's built-in
  // startInLoadingState. That built-in overlay only clears on the *initial*
  // load, so when the preview fails and the WebView instead lands on Figma's
  // login page, the spinner stayed up and swallowed taps on the login button.
  // Here we drop it as soon as any content finishes loading (onLoadEnd fires on
  // success and failure), and the overlay is pointerEvents="none" so it can
  // never trap a tap even if it lingers.
  const [loading, setLoading] = useState(true);

  // Leave the active preview and return to the Figma list/explainer by clearing
  // the route's token (FigmaScreen renders the explainer when it's empty).
  const closePreview = useCallback(() => {
    setTabBarHidden(false);
    router.setParams({ token: '' });
  }, [router]);

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
        // Set only for 'preview-frame-focus'; undefined keys are dropped by
        // JSON.stringify so the haptics diff/refetch envelopes are unchanged.
        nodeId: update.nodeId,
        frameName: update.frameName,
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
      {!tabBarHidden && (
        <View style={styles.previewBar}>
          <TouchableOpacity onPress={closePreview} style={styles.closeBtn} hitSlop={8}>
            <Icon name="x" size={20} color="#001A72" />
            <ThemedText type="defaultSemiBold" style={styles.closeLabel}>
              Close preview
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.webContainer}>
        <WebView
          ref={webRef}
          source={{ uri: previewUrl }}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          onMessage={onMessage}
          onLoadEnd={() => setLoading(false)}
          style={styles.webview}
        />
        {loading && (
          <View style={styles.loader} pointerEvents="none">
            <ActivityIndicator />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

function FigmaExplainer() {
  const router = useRouter();
  const { connections, remove, reconnect } = useConnections();

  // Only Figma producers belong on this screen — browser connections stay on
  // the home list. A preview can only be reopened once its token has arrived.
  const figmaConnections = connections.filter((c) => connectionType(c) === 'figma');

  // We're already on the Figma tab, so update the route param in place rather
  // than pushing a new screen; FigmaScreen renders the WebView when it's set.
  const openPreview = (token: string) => router.setParams({ token });
  const editConnection = (connectionId: string) =>
    router.push({ pathname: '/editConnectionModal', params: { connectionId } });

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

          {figmaConnections.length > 0 && (
            <View style={Margins.marginTop4X}>
              <ThemedText type="subtitle">Your Figma previews</ThemedText>
              <ConnectionList
                connections={figmaConnections}
                onRemove={remove}
                onReconnect={reconnect}
                onOpenPreview={openPreview}
                onEdit={editConnection}
              />
            </View>
          )}

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
                Scan the QR code - PulsarApp opens straight on this screen
                with the preview loaded.
              </ThemedText>
            </Point>
          </Card>

        </BasicLayout>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  webContainer: { flex: 1, backgroundColor: '#fff' },
  webview: { flex: 1 },
  previewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E1F3FA',
    backgroundColor: '#fff',
  },
  closeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  closeLabel: {
    color: '#001A72',
  },
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  scrollContent: { paddingBottom: 40 },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 10,
  },
});
