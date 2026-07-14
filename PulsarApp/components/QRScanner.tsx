import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef } from 'react';
import { Linking, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from './Button';
import { Icon } from './Icon';

interface Props {
  visible: boolean;
  onClose: () => void;
  // Called once with the raw decoded QR string when a code is scanned.
  onScan: (data: string) => void;
}

// Full-screen camera modal that scans a single QR code and hands its raw value
// back via onScan. Handles the camera-permission flow (request / deep-link to
// Settings) and guards against the scanner firing more than once per session.
export default function QRScanner({ visible, onClose, onScan }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const scannedRef = useRef(false);
  // Captured here (inside the SafeAreaProvider) rather than inside the Modal —
  // safe-area context doesn't reach a RN Modal's separate window, so reading it
  // there would yield 0 and leave the close button under the status bar / notch.
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!visible) return;
    // Fresh open → allow one scan again, and ask for access if we still can.
    scannedRef.current = false;
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [visible, permission, requestPermission]);

  const handleBarcode = (result: { data: string }) => {
    if (scannedRef.current) return;
    scannedRef.current = true;
    onScan(result.data);
  };

  const blocked = !!permission && !permission.granted && !permission.canAskAgain;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.container}>
        {permission?.granted ? (
          <>
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={handleBarcode}
            />
            <View style={styles.overlay} pointerEvents="none">
              <View style={styles.frame} />
              <Text style={styles.hint}>Point the camera at a Pulsar QR code</Text>
            </View>
          </>
        ) : (
          <View style={styles.center}>
            <Icon name="qr-code" size={48} color="#FFFFFF" />
            <Text style={styles.permText}>
              {blocked
                ? 'Camera access is off. Enable it in Settings to scan QR codes.'
                : 'Pulsar needs camera access to scan pairing QR codes.'}
            </Text>
            <Button
              label={blocked ? 'Open settings' : 'Allow camera'}
              style={styles.permBtn}
              onClick={() => (blocked ? Linking.openSettings() : requestPermission())}
            />
          </View>
        )}

        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={onClose} hitSlop={12} style={styles.closeBtn}>
            <Icon name="x" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  permText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  permBtn: {
    alignSelf: 'stretch',
    marginTop: 8,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  frame: {
    width: 240,
    height: 240,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  hint: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    alignItems: 'flex-end',
  },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
