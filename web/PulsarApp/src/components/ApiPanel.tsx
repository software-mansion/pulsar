import { useState } from "react";
import { pulsar, presets, realtime, patternComposer } from "../pulsar";

interface Props {
  log: (message: string) => void;
}

export function ApiPanel({ log }: Props) {
  const [haptics, setHaptics] = useState(true);
  const [sound, setSound] = useState(true);

  const toggleHaptics = (value: boolean) => {
    setHaptics(value);
    pulsar.enableHaptics(value);
    log(`enableHaptics(${value})`);
  };

  const toggleSound = (value: boolean) => {
    setSound(value);
    pulsar.enableSound(value);
    log(`enableSound(${value})`);
  };

  const runDemo = () => {
    patternComposer.parse([
      { type: "continuous", timestamp: 0, duration: 40 },
      { type: "pulse", timestamp: 120, duration: 250, intensity: 0.6, frequency: 0.8 },
      { type: "continuous", timestamp: 420, duration: 80 },
    ]);
    const ok = patternComposer.play();
    log(`PatternComposer.play() → ${ok}`);
  };

  const realtimePulse = () => {
    const ok = realtime.set(0.7, 0.7);
    log(`RealtimeComposer.set(0.7, 0.7) → ${ok}`);
    setTimeout(() => {
      realtime.stop();
      log("RealtimeComposer.stop() (auto after 1s)");
    }, 1000);
  };

  return (
    <section className="panel">
      <h2>Pulsar API</h2>
      <div className="toggle-row">
        <label className="toggle">
          <input
            type="checkbox"
            checked={haptics}
            onChange={(e) => toggleHaptics(e.target.checked)}
          />
          enableHaptics
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={sound}
            onChange={(e) => toggleSound(e.target.checked)}
          />
          enableSound
        </label>
      </div>
      <div className="api-grid">
        <div className="api-card">
          <code>isHapticsSupported()</code>
          <span className="desc">Reports Web Vibration API availability.</span>
          <button onClick={() => log(`isHapticsSupported() → ${pulsar.isHapticsSupported()}`)}>
            Call
          </button>
        </div>
        <div className="api-card">
          <code>stopHaptics()</code>
          <span className="desc">Stops every currently playing vibration.</span>
          <button className="danger" onClick={() => log(`stopHaptics() → ${pulsar.stopHaptics()}`)}>
            Call
          </button>
        </div>
        <div className="api-card">
          <code>getPresets().list()</code>
          <span className="desc">All preset names registered in the library.</span>
          <button onClick={() => log(`getPresets().list() → ${presets.list().length} presets`)}>
            Call
          </button>
        </div>
        <div className="api-card">
          <code>PatternComposer.play()</code>
          <span className="desc">Parses and plays a one-shot custom pattern.</span>
          <button onClick={runDemo}>Play demo</button>
        </div>
        <div className="api-card">
          <code>RealtimeComposer.set(i, f)</code>
          <span className="desc">Center the touchpad below to drive it.</span>
          <button onClick={realtimePulse}>Pulse 1s</button>
        </div>
        <div className="api-card">
          <code>RealtimeComposer.stop()</code>
          <span className="desc">Stops the realtime PWM loop.</span>
          <button onClick={() => log(`RealtimeComposer.stop() → ${realtime.stop()}`)}>
            Stop
          </button>
        </div>
      </div>
    </section>
  );
}
