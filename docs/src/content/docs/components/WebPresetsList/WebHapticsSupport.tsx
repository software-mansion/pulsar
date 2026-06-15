import { useEffect, useState } from 'react';
import styles from './WebHapticsSupport.module.scss';

type Support = 'checking' | 'supported' | 'unsupported';

/**
 * Small badge reporting whether the current browser/device can actually play web
 * haptics (i.e. has the Web Vibration API on a touch device). Computed client-side
 * only — renders nothing during SSR / first paint to stay hydration-safe.
 */
export function WebHapticsSupport() {
  const [support, setSupport] = useState<Support>('checking');

  useEffect(() => {
    let cancelled = false;
    import('pulsar-haptics')
      .then(({ Settings }) => {
        if (!cancelled) setSupport(Settings.isHapticsAvailable() ? 'supported' : 'unsupported');
      })
      .catch(() => {
        if (!cancelled) setSupport('unsupported');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (support === 'checking') return null;

  const supported = support === 'supported';
  return (
    <div className={`${styles.badge} ${supported ? styles.supported : styles.unsupported}`}>
      <span className={styles.dot} />
      {supported
        ? 'Haptics supported on this device'
        : 'No vibration on this device — audio preview only'}
    </div>
  );
}
