import { Settings, HapticSupport } from 'react-native-pulsar';

/**
 * What level of haptics this phone's hardware can actually render, as a short stable
 * token for the pairing handshake (`&hapticsSupport=`). The relay hands it to the
 * producer alongside the device name, so a designer tool (Pulsar Studio) can show whether
 * a paired phone will feel the full designed pattern or just a plain buzz.
 *
 * The tokens are the lower-cased names of `react-native-pulsar`'s own `HapticSupport`
 * scale — the value `Settings.getHapticsSupportLevel()` returns — so the wire format is
 * self-describing and doesn't depend on the enum's numbers:
 *   NO_SUPPORT → 'none', LIMITED_SUPPORT → 'limited',
 *   STANDARD_SUPPORT → 'standard', ADVANCED_SUPPORT → 'advanced'.
 */
const TOKENS: Record<HapticSupport, string> = {
  [HapticSupport.NO_SUPPORT]: 'none',
  [HapticSupport.LIMITED_SUPPORT]: 'limited',
  [HapticSupport.STANDARD_SUPPORT]: 'standard',
  [HapticSupport.ADVANCED_SUPPORT]: 'advanced',
};

// The level is fixed for the lifetime of the process, so probe the native module once.
// `undefined` = not probed yet; `null` = probe failed / unknown value (advertise nothing).
let cached: string | null | undefined;

/**
 * The haptics-support token to advertise, or `null` to advertise nothing. Never throws:
 * a capability probe must not be able to break pairing, so a failed or unrecognised
 * reading falls back to null — which the producer treats exactly like an older app that
 * reports no level at all.
 */
export function localHapticsSupport(): string | null {
  if (cached !== undefined) return cached;
  try {
    cached = TOKENS[Settings.getHapticsSupportLevel()] ?? null;
  } catch {
    cached = null;
  }
  return cached;
}
