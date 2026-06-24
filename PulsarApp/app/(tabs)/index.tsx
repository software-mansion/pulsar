import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Platform, TouchableOpacity, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';

import { ThemedText } from '@/components/themed-text';
import QRScanner from '@/components/QRScanner';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '@/components/Card';
import BasicLayout from '@/components/BasicLayout';
import Input from '@/components/Input';
import { Collapsible } from '@/components/ui/collapsible';
import Point from '@/components/Point';
import { Margins } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Settings, HapticSupport } from 'react-native-pulsar';
import Button from '@/components/Button';
import { Icon } from '@/components/Icon';
import {
  useConnections,
  type Connection,
  type ConnectionStatus,
} from '@/contexts/ConnectionsContext';

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

  // A scanned QR is a pairing deep link (pulsarapp://connect?code=… or the
  // unified pulsarapp://figma?token=…&code=…). Parse it the same way the
  // deep-link handler does: add the connection from `code`, and open the
  // preview from `token`.
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
    if (code) addByCode(code, { name });
    if (token) router.push({ pathname: '/figma', params: { token } });
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

          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Your connections</ThemedText>
          </View>

          {connections.length === 0 ? (
            <Card style={Margins.marginTop2X}>
              <ThemedText>
                No connections yet.
              </ThemedText>
            </Card>
          ) : (
            connections.map((c) => (
              <ConnectionRow
                key={c.id}
                connection={c}
                onRemove={() => remove(c.id)}
                onReconnect={() => reconnect(c.id)}
                onOpenPreview={
                  c.previewToken
                    ? () => router.push({ pathname: '/figma', params: { token: c.previewToken } })
                    : undefined
                }
              />
            ))
          )}

          <Card style={Margins.marginTop4X}>
            <ThemedText type="subtitle">Add a new connection</ThemedText>
            <ThemedText style={Margins.marginTop2X}>
              Scan a pairing QR code or enter a connecting code below to add another producer.
            </ThemedText>
            <TouchableOpacity
              style={[styles.scanButton, Margins.marginTop4X]}
              onPress={() => setScannerOpen(true)}
              activeOpacity={0.8}
            >
              <Icon name="qr-code" size={20} color="#001A72" />
              <Text style={styles.scanButtonText}>Scan QR code</Text>
            </TouchableOpacity>
            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>or enter a code</Text>
              <View style={styles.orLine} />
            </View>
            <ConnectionForm
              connectingCode={connectingCode}
              setConnectingCode={setConnectingCode}
              onConnect={handleConnect}
            />
          </Card>

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

// Status-dot colour: green connected, blue in-progress, red dropped.
function statusColor(status: ConnectionStatus): string {
  if (status === 'connected') return '#57B495';
  if (status === 'connecting' || status === 'waiting') return '#38ACDD';
  return '#FF6259';
}

// Short label shown under the name only while not fully connected (the green
// dot speaks for the connected case).
function statusLabel(status: ConnectionStatus): string {
  switch (status) {
    case 'connected':
      return 'Connected';
    case 'connecting':
      return 'Connecting…';
    case 'waiting':
      return 'Waiting for connection…';
    case 'offline':
      return 'Offline';
    case 'error':
      return 'Couldn’t connect';
  }
}

function ConnectionRow({
  connection,
  onRemove,
  onReconnect,
  onOpenPreview,
}: {
  connection: Connection;
  onRemove: () => void;
  onReconnect: () => void;
  onOpenPreview?: () => void;
}) {
  const { name, status, token } = connection;
  // Retry reinitialises the link (tears the socket down and re-opens from the
  // token). Only meaningful once a token exists — i.e. the pairing succeeded
  // at least once; a brand-new connection still negotiating has nothing to reuse.
  const canRetry = !!token;

  return (
    <Card style={styles.connCard}>
      <View style={styles.connRow}>
        <View style={[styles.statusDot, { backgroundColor: statusColor(status) }]} />
        <View style={styles.connInfo}>
          <ThemedText type="defaultSemiBold" numberOfLines={1}>
            {name}
          </ThemedText>
          {status !== 'connected' && (
            <ThemedText style={styles.statusTextSmall} numberOfLines={1}>
              {statusLabel(status)}
            </ThemedText>
          )}
        </View>
        {onOpenPreview && (
          <TouchableOpacity onPress={onOpenPreview} hitSlop={8} style={styles.iconBtn}>
            <Icon name="figma" size={20} color="#001A72" />
          </TouchableOpacity>
        )}
        {canRetry && (
          <TouchableOpacity
            onPress={onReconnect}
            hitSlop={8}
            style={styles.iconBtn}
            accessibilityLabel="Reload connection"
          >
            <Icon name="refresh-cw" size={20} color="#001A72" />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onRemove} hitSlop={8} style={styles.iconBtn}>
          <Icon name="x" size={22} color="#FF6259" />
        </TouchableOpacity>
      </View>
    </Card>
  );
}

function ConnectionForm({
  connectingCode,
  setConnectingCode,
  onConnect,
}: {
  connectingCode: string;
  setConnectingCode: (code: string) => void;
  onConnect: () => void;
}) {
  return (
    <View>
      <View style={styles.connectRow}>
        <Input
          placeholder="Connecting code"
          style={styles.connectInput}
          value={connectingCode}
          onChangeText={setConnectingCode}
        />
        <Button label="Connect" style={styles.connectBtn} onClick={onConnect} />
      </View>
      <Collapsible title="How to connect a device? 🤔" style={Margins.marginTop4X}>
        <Point index={1}>
          <ThemedText>
            Open the Pulsar plugin in Figma (Presets tab → Phone) or the Connection widget in the
            Pulsar docs.
          </ThemedText>
        </Point>
        <Point index={2}>
          <ThemedText>
            Scan the QR code with this app, or type the pairing code above and tap Connect.
          </ThemedText>
        </Point>
        <Point index={3}>
          <ThemedText>
            Pick a preset on the plugin or website and feel the haptics right on your device.
          </ThemedText>
        </Point>
      </Collapsible>
    </View>
  );
}

function PatternIsPlaying({ found, name }: { found: boolean; name: string }) {
  return (
    <Card style={Margins.marginTop4X} enableAnimation={true}>
      <ThemedText type="defaultSemiBold">
        {found ? `${name} is playing!` : 'Preset not found!'}
      </ThemedText>
    </Card>
  );
}

function HapticsSupportBanner({ level, onClose }: { level: HapticSupport; onClose: () => void }) {
  const getLevelInfo = (): { name: string; description: string } => {
    switch (level) {
      case HapticSupport.ADVANCED_SUPPORT:
        return { name: 'Advanced', description: 'All presets are fully supported on your device.' };
      case HapticSupport.STANDARD_SUPPORT:
        return { name: 'Standard', description: 'Most presets are fully supported on your device.' };
      case HapticSupport.LIMITED_SUPPORT:
        return {
          name: 'Limited',
          description: 'Some presets may not work as expected on your device.',
        };
      default:
        return { name: 'None', description: 'Your device does not support haptics.' };
    }
  };

  const { name, description } = getLevelInfo();

  return (
    <Card style={Margins.marginTop4X}>
      <TouchableOpacity onPress={onClose} style={styles.hapticsBannerClose}>
        <Icon name="x" size={34} color="#001A72" />
      </TouchableOpacity>
      <ThemedText type="subtitle">Haptic support: {name}</ThemedText>
      <ThemedText style={Margins.marginTop2X}>{description}</ThemedText>
    </Card>
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countBadge: {
    backgroundColor: '#E1F3FA',
    color: '#001A72',
    fontWeight: 'bold',
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 1,
    overflow: 'hidden',
  },
  connCard: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 10,
  },
  connRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  connInfo: {
    flex: 1,
    marginRight: 8,
  },
  statusTextSmall: {
    fontSize: 13,
    color: '#496695',
    marginTop: 1,
  },
  iconBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'white',
    borderRadius: 4,
    paddingVertical: 16,
    borderColor: '#38ACDD',
    borderWidth: 2,
    boxShadow: '-3px 3px 0px #38ACDD',
  },
  scanButtonText: {
    fontSize: 16,
    color: '#001A72',
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#CFE6F2',
  },
  orText: {
    color: '#496695',
    fontSize: 13,
  },
  connectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  connectInput: {
    flex: 1,
  },
  connectBtn: {
    paddingHorizontal: 18,
    marginTop: -5,
  },
  hapticsBannerClose: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
});
