import * as Device from 'expo-device';
import { Platform } from 'react-native';

/**
 * What this phone calls itself on the pairing handshake, e.g. "iPhone 15 Pro" or
 * "Pixel 8". The relay hands it to the producer as `deviceName`, so a designer tool
 * (Pulsar Studio) can label the device it just paired with instead of "Device 2".
 *
 * `modelName` is null on a simulator or when the OS won't say, so it falls back to
 * something honest rather than advertising nothing — "iOS device" still beats a bare
 * ordinal. Kept short: it's a query param on every handshake, and the producer renders
 * it in a narrow list row.
 */
export function localDeviceName(): string {
  const model = Device.modelName?.trim();
  if (model) return model.slice(0, 60);
  return Platform.OS === 'ios' ? 'iOS device' : Platform.OS === 'android' ? 'Android device' : 'Phone';
}
