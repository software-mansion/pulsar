import { useEffect, useState } from 'react';
import { InfoIcon, VolumeIcon } from './Icons';
import { isHapticsAvailable, isSoundEnabled, setSoundEnabled } from '../haptics';

/**
 * Web haptics only exist behind the Vibration API, which desktop browsers and
 * iOS Safari do not expose. Rather than silently doing nothing, say so — and
 * offer the audio rendering that `Preset` falls back to, so the pattern is at
 * least perceivable while you are at a laptop.
 */
export function HapticsBanner() {
  const [supported, setSupported] = useState(true);
  const [sound, setSound] = useState(true);

  // Support detection reads `navigator`/`matchMedia`, so resolve it after mount.
  useEffect(() => {
    setSupported(isHapticsAvailable());
    setSound(isSoundEnabled());
  }, []);

  if (supported) {
    return (
      <p className="muted" style={{ marginTop: 10 }}>
        Haptic support: Vibration API available — presets play on the motor.
      </p>
    );
  }

  return (
    <div className="banner">
      <InfoIcon size={20} />
      <div className="banner__body">
        This browser has no Vibration API, so nothing will buzz. Open{' '}
        <strong>docs.swmansion.com/pulsar/web-app/</strong> on an Android phone to feel it for real.
        Meanwhile, Pulsar can render each pattern as sound so you can still hear its rhythm.
        <label className="switch">
          <input
            type="checkbox"
            checked={sound}
            onChange={(event) => {
              setSound(event.target.checked);
              setSoundEnabled(event.target.checked);
            }}
          />
          <VolumeIcon size={18} muted={!sound} />
          Audio fallback {sound ? 'on' : 'off'}
        </label>
      </div>
    </div>
  );
}
