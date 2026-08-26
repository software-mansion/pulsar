import { useEffect, useRef, useState } from 'react';
import { PRESETS } from '../../data/presets';
import { playPattern, stopPattern } from '../../haptics';

type Notification = {
  id: string;
  title: string;
  message: string;
  color: string;
  /** Name of the built-in web preset that carries this notification's feel. */
  preset: string;
  glyph: string;
};

const NOTIFICATIONS: Notification[] = [
  {
    id: 'success',
    title: 'Success',
    message: 'Payment received successfully',
    color: '#10B981',
    preset: 'Connect',
    glyph: '✓',
  },
  {
    id: 'alert',
    title: 'Alert',
    message: 'Low battery warning',
    color: '#F59E0B',
    preset: 'Alert',
    glyph: '!',
  },
  {
    id: 'message',
    title: 'Message',
    message: 'You have a new message',
    color: '#3B82F6',
    preset: 'DoubleTap',
    glyph: '✉',
  },
  {
    id: 'error',
    title: 'Error',
    message: 'Connection failed',
    color: '#EF4444',
    preset: 'Reject',
    glyph: '✕',
  },
  {
    id: 'reminder',
    title: 'Reminder',
    message: 'Meeting starts in 15 minutes',
    color: '#8B5CF6',
    preset: 'Alarm',
    glyph: '⏰',
  },
];

const STEP_MS = 1400;

export function NotificationDemo() {
  const [index, setIndex] = useState<number | null>(null);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      window.clearTimeout(timerRef.current);
      stopPattern();
    };
  }, []);

  useEffect(() => {
    if (index === null) return;

    const notification = NOTIFICATIONS[index];
    const entry = PRESETS.find((preset) => preset.data.name === notification.preset);
    if (entry) playPattern(entry.data.name, entry.data.pattern);

    timerRef.current = window.setTimeout(() => {
      setIndex(index + 1 < NOTIFICATIONS.length ? index + 1 : null);
    }, STEP_MS);

    return () => window.clearTimeout(timerRef.current);
  }, [index]);

  const current = index === null ? null : NOTIFICATIONS[index];

  return (
    <>
      <h1 className="title">Notification haptics</h1>
      <p className="lead">
        Five notification types, five different feelings. Play the sequence and notice how the
        haptic alone tells you which kind of message just arrived.
      </p>

      <div className="toast-slot">
        {current && (
          <div className="card toast" key={current.id}>
            <span className="toast__badge" style={{ background: current.color }}>
              {current.glyph}
            </span>
            <span>
              <span className="toast__title">{current.title}</span>
              <br />
              <span className="toast__message">{current.message}</span>
            </span>
          </div>
        )}
      </div>

      <button
        type="button"
        className="btn"
        style={{ width: '100%', marginTop: 20 }}
        disabled={index !== null}
        onClick={() => setIndex(0)}
      >
        {index === null ? 'Play sequence' : 'Playing…'}
      </button>

      <div className="stack">
        {NOTIFICATIONS.map((notification) => (
          <button
            key={notification.id}
            type="button"
            className="row-card"
            onClick={() => {
              const entry = PRESETS.find((preset) => preset.data.name === notification.preset);
              if (entry) playPattern(entry.data.name, entry.data.pattern);
            }}
          >
            <span>
              <span className="toast__title">{notification.title}</span>
              <br />
              <span className="muted">{notification.preset} preset</span>
            </span>
            <span
              className="toast__badge"
              style={{ background: notification.color, width: 32, height: 32 }}
            >
              {notification.glyph}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}
