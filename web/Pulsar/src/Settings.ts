import { HapticSupport, RealtimeComposerStrategy } from './types';
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

  getHapticsSupportLevel: (): HapticSupport => {
    return isVibrationSupported()
      ? HapticSupport.MINIMAL_SUPPORT
      : HapticSupport.NO_SUPPORT;
  },

  /** Not applicable on web. */
  setRealtimeComposerStrategy: (_strategy: RealtimeComposerStrategy) => {},
} as const;

export default Settings;
