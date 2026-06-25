import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, HapticSupport } from 'react-native-pulsar';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/themed-text';
import BasicLayout from '@/components/BasicLayout';
import QRScanner from '@/components/QRScanner';
import AddConnectionCard from '@/components/home/AddConnectionCard';
import ConnectionList from '@/components/home/ConnectionList';
import HapticsSupportBanner from '@/components/home/HapticsSupportBanner';
import PatternIsPlaying from '@/components/home/PatternIsPlaying';
import { useConnections } from '@/contexts/ConnectionsContext';

const logo = require('@/assets/images/logo.png');

export default function HomeScreen() {
  const { connections, addByCode, remove, reconnect, lastReceived } = useConnections();
  const router = useRouter();

  const [connectingCode, setConnectingCode] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [showHapticsBanner, setShowHapticsBanner] = useState(false);
  const [hapticsSupportLevel, setHapticsSupportLevel] = useState<HapticSupport>(
    HapticSupport.NO_SUPPORT,
  );

  useEffect(() => {
    Settings.enableSound(true);
  }, []);

  useEffect(() => {
    if (Platform.OS === 'android') {
      AsyncStorage.getItem('hapticsSupportBannerDismissed').then((value) => {
        if (!value) {
          setHapticsSupportLevel(Settings.getHapticsSupportLevel());
          setShowHapticsBanner(true);
        }
      });
    }
  }, []);

  const handleCloseBanner = () => {
    setShowHapticsBanner(false);
    AsyncStorage.setItem('hapticsSupportBannerDismissed', 'true');
  };

  const handleConnect = () => {
    const code = connectingCode.trim();
    if (!code) return;
    addByCode(code);
    setConnectingCode('');
  };

  const openPreview = (token: string) => router.push({ pathname: '/figma', params: { token } });

  const editConnection = (connectionId: string) =>
    router.push({ pathname: '/editConnectionModal', params: { connectionId } });

  // A scanned QR is a pairing deep link (pulsarapp:///?code=… or the unified
  // pulsarapp://figma?token=…&code=…). Parse it the same way the deep-link
  // handler does: add the connection from `code`, and open the preview from
  // `token`.
  const handleScan = (data: string) => {
    setScannerOpen(false);
    let code: string | undefined;
    let name: string | undefined;
    let token: string | undefined;
    try {
      const parsed = Linking.parse(data);
      code = parsed.queryParams?.code?.toString();
      name = parsed.queryParams?.name?.toString();
      token = parsed.queryParams?.token?.toString();
    } catch {
      // not a parseable URL — fall through to the bare-code check below
    }
    // Fallback: a QR encoding just the bare pairing code.
    if (!code && !token && /^\d{3,}$/.test(data.trim())) {
      code = data.trim();
    }
    // A figma QR carries the preview token; seed it (and the Figma type) onto
    // the connection so the row is tagged Figma and can reopen the preview.
    if (code) {
      addByCode(code, { name, ...(token ? { previewToken: token, producerType: 'figma' as const } : {}) });
    }
    if (token) openPreview(token);
    if (!code && !token) {
      Alert.alert('Unrecognized QR code', 'That doesn’t look like a Pulsar pairing code.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <BasicLayout>
          <View style={styles.titleContainer}>
            <ThemedText type="title">Welcome to Pulsar!</ThemedText>
            <Image source={logo} style={styles.logo} />
          </View>

          <ThemedText type="subtitle">Your connections</ThemedText>

          <ConnectionList
            connections={connections}
            onRemove={remove}
            onReconnect={reconnect}
            onOpenPreview={openPreview}
            onEdit={editConnection}
          />

          <AddConnectionCard
            connectingCode={connectingCode}
            setConnectingCode={setConnectingCode}
            onConnect={handleConnect}
            onScanPress={() => setScannerOpen(true)}
          />

          {showHapticsBanner && (
            <HapticsSupportBanner level={hapticsSupportLevel} onClose={handleCloseBanner} />
          )}
        </BasicLayout>
      </ScrollView>

      {/* Floating "preset received" banner — pinned above the tab bar so it's
          always visible regardless of how many connections fill the list. */}
      {lastReceived && (
        <View style={styles.toast} pointerEvents="none">
          <PatternIsPlaying found={lastReceived.found} name={lastReceived.name} />
        </View>
      )}

      <QRScanner visible={scannerOpen} onClose={() => setScannerOpen(false)} onScan={handleScan} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    // Small breathing room only — the tab bar is the bottom boundary, not an
    // extra safe-area inset (the SafeAreaView omits the bottom edge above).
    paddingBottom: 12,
  },
  toast: {
    position: 'absolute',
    left: 15,
    right: 15,
    bottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 30,
  },
  logo: {
    width: 50,
    height: 50,
    marginTop: -10,
  },
});
