import { useRef, useState } from 'react';
import styles from './DebugPanel.module.css';
import { send } from '../figmaBridge';
import type { DebugAction } from '../../shared/types';

// Debug tab - only mounted in developer mode (see the toggle in the Help tab).
// A flat list of one-off maintenance actions. Storage-touching actions run on
// the main thread (clientStorage / root pluginData live there); UI-only actions
// take a callback.
export default function DebugPanel({ onShowOnboarding }: { onShowOnboarding: () => void }) {
  const run = (action: DebugAction) => send({ type: 'debug-action', action });

  // Two-step confirm for the destructive clear - window.confirm/alert are
  // unavailable in the sandboxed plugin iframe, so arm-then-fire in the UI.
  const [armed, setArmed] = useState(false);
  const armTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearAll = () => {
    if (!armed) {
      setArmed(true);
      if (armTimer.current) clearTimeout(armTimer.current);
      armTimer.current = setTimeout(() => setArmed(false), 3000);
      return;
    }
    if (armTimer.current) clearTimeout(armTimer.current);
    setArmed(false);
    run('clear-storage');
  };

  return (
    <div className={`col scroll ${styles['debug-panel']}`}>
      <div>
        <div className="panel-title">Debug</div>
        <p className={`muted ${styles['debug-intro']}`}>
          Developer-only maintenance actions. Turn this tab off in Help → Developer mode.
        </p>
      </div>

      <div className={styles['debug-actions']}>
        <button
          className={`${styles['debug-btn']} ${styles['danger']}${armed ? ` ${styles['armed']}` : ''}`}
          onClick={clearAll}
        >
          <span className={styles['debug-btn-label']}>
            {armed ? 'Click again to confirm' : 'Clear all plugin data'}
          </span>
          <span className={styles['debug-btn-hint']}>
            Wipes clientStorage + this file’s pluginData (tokens, cache, settings,
            onboarding). Reopen the plugin afterwards for a clean state.
          </span>
        </button>

        <button className={`ghost ${styles['debug-btn']}`} onClick={() => run('reset-onboarding')}>
          <span className={styles['debug-btn-label']}>Reset onboarding (this file)</span>
          <span className={styles['debug-btn-hint']}>
            Clears the “seen” flag so the tour auto-opens again for this file.
          </span>
        </button>

        <button className={`ghost ${styles['debug-btn']}`} onClick={onShowOnboarding}>
          <span className={styles['debug-btn-label']}>Show onboarding tour</span>
          <span className={styles['debug-btn-hint']}>Opens the first-run tour right now.</span>
        </button>

        <button className={`ghost ${styles['debug-btn']}`} onClick={() => run('log-storage')}>
          <span className={styles['debug-btn-label']}>Log storage to console</span>
          <span className={styles['debug-btn-hint']}>
            Dumps clientStorage + pluginData to the plugin console.
          </span>
        </button>
      </div>
    </div>
  );
}
