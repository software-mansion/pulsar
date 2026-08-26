import type { HapticPattern } from 'pulsar-haptics';
import { playCue } from '../../haptics';

const BUTTONS: { label: string; pattern: HapticPattern }[] = [
  { label: 'Tap', pattern: [{ type: 'continuous', timestamp: 0, duration: 35 }] },
  {
    label: 'Soft',
    pattern: [{ type: 'pulse', timestamp: 0, duration: 50, intensity: 0.35, frequency: 0.5 }],
  },
  { label: 'Deep', pattern: [{ type: 'continuous', timestamp: 0, duration: 90 }] },
  {
    label: 'Double',
    pattern: [
      { type: 'continuous', timestamp: 0, duration: 30 },
      { type: 'continuous', timestamp: 90, duration: 30 },
    ],
  },
  {
    label: 'Knock',
    pattern: [
      { type: 'continuous', timestamp: 0, duration: 45 },
      { type: 'continuous', timestamp: 180, duration: 35 },
    ],
  },
  {
    label: 'Ripple',
    pattern: [
      { type: 'continuous', timestamp: 0, duration: 40 },
      { type: 'continuous', timestamp: 70, duration: 28 },
      { type: 'continuous', timestamp: 140, duration: 18 },
      { type: 'continuous', timestamp: 210, duration: 10 },
    ],
  },
];

export function ButtonsDemo() {
  return (
    <>
      <h1 className="title">Buttons haptics grid</h1>
      <p className="lead">Tap each button to feel a different haptic pattern.</p>

      <div className="grid">
        {BUTTONS.map((button) => (
          <button
            key={button.label}
            type="button"
            className="btn"
            onClick={() => playCue(button.pattern)}
          >
            {button.label}
          </button>
        ))}
      </div>
    </>
  );
}
