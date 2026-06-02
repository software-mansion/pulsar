import Pulsar, { HapticSupport, RealtimeComposerStrategy } from './NativeRNPulsar';

// Workaround for RN prototype caching issue: TurboModule method bindings need
// to be read once on the JS thread before they can be called reliably. We do
// this lazily, on the first call into Settings, so that simply importing
// `react-native-pulsar` (e.g. via `import { Settings } from ...`) does not
// force eager native-module materialization at app cold start. None of these
// methods are called from worklets, so a lazy prime on JS thread is safe —
// `Presets` keeps its top-level prime because those wrappers are worklets and
// need the bindings ready before the first worklet invocation.
let settingsPrimed = false;
const primeSettings = () => {
  if (settingsPrimed) return;
  settingsPrimed = true;
  Pulsar.Pulsar_enableHaptics;
  Pulsar.Pulsar_enableSound;
  Pulsar.Pulsar_enableCache;
  Pulsar.Pulsar_clearCache;
  Pulsar.Pulsar_preloadPresets;
  Pulsar.Pulsar_stopHaptics;
  Pulsar.Pulsar_shutDownEngine;
  Pulsar.Pulsar_hapticSupport;
  Pulsar.Pulsar_forceHapticsSupportLevel;
  Pulsar.Pulsar_enableImpulseCompositionMode;
  Pulsar.Pulsar_setRealtimeComposerStrategy;
};

const Settings = {
  enableHaptics: (state: boolean) => {
    primeSettings();
    Pulsar.Pulsar_enableHaptics(state);
  },
  enableSound: (state: boolean) => {
    primeSettings();
    Pulsar.Pulsar_enableSound(state);
  },
  enableCache: (state: boolean) => {
    primeSettings();
    Pulsar.Pulsar_enableCache(state);
  },
  clearCache: () => {
    primeSettings();
    Pulsar.Pulsar_clearCache();
  },
  preloadPresets: (presetNames: Array<String>) => {
    primeSettings();
    Pulsar.Pulsar_preloadPresets(presetNames);
  },
  stopHaptics: () => {
    primeSettings();
    Pulsar.Pulsar_stopHaptics();
  },
  shutDownEngine: () => {
    primeSettings();
    Pulsar.Pulsar_shutDownEngine();
  },
  getHapticsSupportLevel: () => {
    primeSettings();
    return Pulsar.Pulsar_hapticSupport();
  },
  forceHapticsSupportLevel: (level: HapticSupport) => {
    primeSettings();
    Pulsar.Pulsar_forceHapticsSupportLevel(level);
  },
  enableImpulseCompositionMode: (state: boolean) => {
    primeSettings();
    Pulsar.Pulsar_enableImpulseCompositionMode(state);
  },
  setRealtimeComposerStrategy: (strategy: RealtimeComposerStrategy) => {
    primeSettings();
    Pulsar.Pulsar_setRealtimeComposerStrategy(strategy);
  },

} as const;

export default Settings;
