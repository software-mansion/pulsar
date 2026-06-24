import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Button from '@/components/Button';
import Card from '@/components/Card';
import { Icon } from '@/components/Icon';
import Input from '@/components/Input';
import Point from '@/components/Point';
import { ThemedText } from '@/components/themed-text';
import { Collapsible } from '@/components/ui/collapsible';
import { Margins } from '@/constants/theme';

export default function AddConnectionCard({
  connectingCode,
  setConnectingCode,
  onConnect,
  onScanPress,
}: {
  connectingCode: string;
  setConnectingCode: (code: string) => void;
  onConnect: () => void;
  onScanPress: () => void;
}) {
  return (
    <Card style={Margins.marginTop4X}>
      <ThemedText type="subtitle">Add a new connection</ThemedText>
      <ThemedText style={Margins.marginTop2X}>
        Scan a pairing QR code or enter a connecting code below to add another producer.
      </ThemedText>

      <TouchableOpacity
        style={[styles.scanButton, Margins.marginTop4X]}
        onPress={onScanPress}
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
    </Card>
  );
}

const styles = StyleSheet.create({
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
});
