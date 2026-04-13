import { RealtimeComposerStrategy } from './types';
import { isVibrationSupported } from './engine';
import { setHapticsEnabled, setSoundEnabled } from './state';
import { stopVibration } from './engine';

const Settings = {
  enableHaptics: (state: boolean) => {
    setHapticsEnabled(state);
    if (!state) {
      stopVibration();
    }
  },

  enableSound: (state: boolean) => {
    setSoundEnabled(state);
  },

  stopHaptics: () => {
    stopVibration();
  },

  isHapticsAvailable: (): boolean => {
    // Vibration API (Android/Chrome) or Safari checkbox trick (iOS Safari)
    return isVibrationSupported() || typeof document !== 'undefined';
  },

  /** Not applicable on web. */
  setRealtimeComposerStrategy: (_strategy: RealtimeComposerStrategy) => {},
} as const;

export default Settings;
