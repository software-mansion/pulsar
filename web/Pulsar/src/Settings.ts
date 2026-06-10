type StopHapticsHandler = () => void;

let hapticsEnabled = true;
let soundEnabled = true;
const stopHapticsHandlers = new Set<StopHapticsHandler>();

// Desktop browsers (Chrome/Edge/Firefox) expose `navigator.vibrate` but treat
// it as a silent no-op that still returns `true`. Relying on the function's mere
// existence makes callers believe a haptic played when nothing was felt, which
// in turn suppresses the audio fallback the desktop web preview relies on.
// Only treat the device as actually able to vibrate when its primary pointer is
// coarse — i.e. a touch-first / mobile device. When there is no DOM (SSR, tests)
// we can't probe, so we assume capable and let the caller take the vibrate path.
const canActuallyVibrate = () => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return true;
  }

  return window.matchMedia("(pointer: coarse)").matches;
};

const isHapticsAvailable = () => {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.vibrate === "function" &&
    canActuallyVibrate()
  );
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
