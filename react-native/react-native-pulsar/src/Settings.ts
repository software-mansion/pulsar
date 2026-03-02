import Pulsar, { HapticSupport } from './NativeRNPulsar';

// workaround for RN prototype caching issue 
Pulsar.Pulsar_enableSound;
Pulsar.Pulsar_enableCache;
Pulsar.Pulsar_clearCache;
Pulsar.Pulsar_preloadPresets;
Pulsar.Pulsar_stopHaptics;
Pulsar.Pulsar_shutDownEngine;
Pulsar.Pulsar_hapticSupport;
Pulsar.Pulsar_forceHapticsSupportLevel

const Settings = {
  enableHaptics: (state: boolean) => {
    Pulsar.Pulsar_enableHaptics(state);
  },
  enableSound: (state: boolean) => {
    Pulsar.Pulsar_enableSound(state);
  },
  enableCache: (state: boolean) => {
    Pulsar.Pulsar_enableCache(state);
  },
  clearCache: () => {
    Pulsar.Pulsar_clearCache();
  },
  preloadPresets: (presetNames: Array<String>) => {
    Pulsar.Pulsar_preloadPresets(presetNames);
  },
  stopHaptics: () => {
    Pulsar.Pulsar_stopHaptics();
  },
  shutDownEngine: () => {
    Pulsar.Pulsar_shutDownEngine();
  },
  getHapticsSupportLevel: () => {
    return Pulsar.Pulsar_hapticSupport();
  },
  forceHapticsSupportLevel: (level: HapticSupport) => {
    Pulsar.Pulsar_forceHapticsSupportLevel(level);
  }
  
} as const;

export default Settings;
