import styles from './PhonePanel.module.css';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { send } from '../figmaBridge';
import type { PhonePhase } from '../hooks/usePhoneConnection';
import iconSmartphone from '../assets/icon-smartphone.svg';
import iconRefresh from '../assets/icon-refresh.svg';
import storeApple from '../assets/store-apple.svg';
import storeGoogle from '../assets/store-google.png';

// Public store listings for the Pulsar mobile app - same links the docs
// Connection component uses. Shown to users who don't have the app yet, either
// as tappable badges or as scannable QR codes.
const APPLE_STORE_URL = 'https://apps.apple.com/pl/app/haptics-presets-pulsar/id6761362104';
const GOOGLE_STORE_URL = 'https://play.google.com/store/apps/details?id=com.swmansion.pulsar.app';

// Presentational pairing panel. The actual socket + pairing state machine lives
// in usePhoneConnection at the app root (so the link survives tab switches);
// this component only renders whatever state it's handed and exposes the two
// user actions (retry a failed pairing, disconnect a paired phone).
export default function PhonePanel({
  paired,
  connected,
  phase,
  code,
  qrDataUrl,
  error,
  onRefresh,
  onDisconnect
}: {
  paired: boolean;
  connected: boolean;
  phase: PhonePhase;
  code: string | null;
  qrDataUrl: string | null;
  error: string | null;
  onRefresh: () => void;
  onDisconnect: () => void;
}) {
  // "Get the app" affordance: toggles store-download QR codes; generated lazily
  // the first time they're shown.
  const [showStoreQr, setShowStoreQr] = useState(false);
  const [storeQr, setStoreQr] = useState<{ apple: string; google: string } | null>(null);

  // Generate the store-download QR codes the first time the user reveals them.
  // The URLs are static, so this runs once and is cached in state thereafter.
  useEffect(() => {
    if (!showStoreQr || storeQr) return;
    let cancelled = false;
    const opts = { margin: 1, color: { dark: '#001a72', light: '#e1f3fa' }, width: 200 };
    Promise.all([
      QRCode.toDataURL(APPLE_STORE_URL, opts),
      QRCode.toDataURL(GOOGLE_STORE_URL, opts)
    ])
      .then(([apple, google]) => {
        if (!cancelled) setStoreQr({ apple, google });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [showStoreQr, storeQr]);

  return (
    // No accordion chrome - the QR (while pairing) or the connection status
    // (once paired) is shown directly. The collapsible step card around it owns
    // the show/hide affordance now.
    <div className="col">
      {paired ? (
        <div className={styles['phone-card']}>
          <span className={styles['phone-card-ic']}>
            <img src={iconSmartphone} alt="" />
          </span>
          <div className={styles['phone-card-main']}>
            <div className={styles['phone-card-title']}>
              <span className={`${styles['status-dot']} ${connected ? styles['ok'] : styles['err']}`} />
              {connected ? 'Connected' : 'Phone offline'}
            </div>
            <p className={styles['phone-card-text']}>
              {connected
                ? 'Your phone will play each preset as you preview it.'
                : 'Paired, but your phone isn’t reachable. Open the Pulsar app to reconnect.'}
            </p>
            <div className={`row ${styles['phone-card-actions']}`}>
              <button className="ghost" onClick={onDisconnect}>Disconnect</button>
              <button
                className="ghost preset-action-btn"
                onClick={onRefresh}
                title="Refresh connection"
                aria-label="Refresh connection"
              >
                <img src={iconRefresh} alt="" width={14} height={14} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {phase === 'error' ? (
            <div className={styles['phone-card']}>
              <span className={styles['phone-card-ic']}>
                <img src={iconSmartphone} alt="" />
              </span>
              <div className={styles['phone-card-main']}>
                <div className={styles['phone-card-title']}>
                  <span className={`${styles['status-dot']} ${styles['err']}`} />
                  Couldn’t connect
                </div>
                <p className={styles['phone-card-text']}>{error ?? 'Unknown error.'}</p>
                <button
                  className="ghost preset-action-btn"
                  onClick={onRefresh}
                  title="Refresh connection"
                >
                  <img src={iconRefresh} alt="" width={14} height={14} />
                  <span>Retry</span>
                </button>
              </div>
            </div>
          ) : phase === 'awaiting-phone' ? (
            // Pairing channel is live - show the QR directly (no extra click).
            <div className={styles['phone-await']}>
              {qrDataUrl && <img className={styles['phone-qr']} src={qrDataUrl} alt="Scan with Pulsar" />}
              <div className="row">
                <span className="muted">Code</span>
                <span className={`mono ${styles['phone-code']}`}>{code}</span>
              </div>
              <p className={`${styles['phone-card-text']} ${styles['phone-await-hint']}`}>
                Open the Pulsar mobile app and scan the QR (or enter the code).
              </p>
            </div>
          ) : (
            // idle / requesting - auto-pairing is in flight, the QR is on its way.
            <div className={styles['phone-card']}>
              <span className={styles['phone-card-ic']}>
                <img src={iconSmartphone} alt="" />
              </span>
              <div className={styles['phone-card-main']}>
                <div className={styles['phone-card-title']}>
                  <span className={styles['status-dot']} />
                  Preparing your pairing QR…
                </div>
              </div>
            </div>
          )}

          {/* Get-the-app helper for users who haven't installed Pulsar yet -
              store badges (open via the main thread) plus an optional QR to
              scan the store listing straight onto their phone. */}
          <div className={styles['phone-getapp']}>
            <p className={styles['phone-getapp-label']}>Don’t have the Pulsar app yet?</p>
            <div className={styles['phone-store-badges']}>
              <button
                type="button"
                className={styles['phone-store-link']}
                onClick={() => send({ type: 'open-external', url: APPLE_STORE_URL })}
                aria-label="Download on the App Store"
              >
                <img className={styles['phone-store-badge']} src={storeApple} alt="Download on the App Store" />
              </button>
              <button
                type="button"
                className={styles['phone-store-link']}
                onClick={() => send({ type: 'open-external', url: GOOGLE_STORE_URL })}
                aria-label="Get it on Google Play"
              >
                <img className={styles['phone-store-badge']} src={storeGoogle} alt="Get it on Google Play" />
              </button>
            </div>
            <button
              type="button"
              className={`ghost ${styles['phone-getapp-toggle']}`}
              onClick={() => setShowStoreQr((v) => !v)}
              aria-expanded={showStoreQr}
            >
              {showStoreQr ? 'Hide QR code' : 'Show QR code'}
            </button>
            {showStoreQr && (
              <div className={styles['phone-store-qrs']}>
                <figure className={styles['phone-store-qr']}>
                  {storeQr && <img src={storeQr.apple} alt="App Store download QR" />}
                  <figcaption>iOS</figcaption>
                </figure>
                <figure className={styles['phone-store-qr']}>
                  {storeQr && <img src={storeQr.google} alt="Google Play download QR" />}
                  <figcaption>Android</figcaption>
                </figure>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
