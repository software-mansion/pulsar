type StopHapticsHandler = () => void;

let hapticsEnabled = true;
let soundEnabled = true;
const stopHapticsHandlers = new Set<StopHapticsHandler>();

const isHapticsAvailable = () => {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
};

const stopBrowserVibration = () => {
  if (!isHapticsAvailable()) {
    return false;
  }

  return navigator.vibrate(0);
};

const Settings = {
  enableHaptics: (state: boolean) => {
    hapticsEnabled = state;

    if (!state) {
      Settings.stopHaptics();
    }
  },

  enableSound: (state: boolean) => {
    soundEnabled = state;
  },

  isHapticsEnabled: () => {
    return hapticsEnabled;
  },

  isSoundEnabled: () => {
    return soundEnabled;
  },

  isHapticsAvailable,

  stopHaptics: () => {
    for (const stopHandler of stopHapticsHandlers) {
      stopHandler();
    }

    return stopBrowserVibration();
  },

  registerStopHapticsHandler: (handler: StopHapticsHandler) => {
    stopHapticsHandlers.add(handler);

    return () => {
      stopHapticsHandlers.delete(handler);
    };
  },
} as const;

export default Settings;
