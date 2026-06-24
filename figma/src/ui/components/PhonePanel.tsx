import styles from './PhonePanel.module.css';
import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import iconSmartphone from '../assets/icon-smartphone.svg';
import iconChevron from '../assets/icon-chevron-down.svg';
import iconQr from '../assets/icon-qr-code.svg';

const API_SERVER_URL = 'https://pulsar-server.swmansion.com';
const SOCKET_SERVER_URL = 'wss://pulsar-server.swmansion.com';

// Keep the sender socket alive so the server's heartbeat sweep doesn't reap it
// while the phone is away. Matches the docs Connection component's interval.
const PING_INTERVAL_MS = 25_000;

// Human label the phone shows for this producer in its connection list. The OS
// is best-effort from the plugin iframe's userAgent; the bare "Figma Plugin"
// fallback is fine when it can't be determined.
function detectOS(): string {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  if (/Mac/i.test(ua)) return 'macOS';
  if (/Win/i.test(ua)) return 'Windows';
  if (/Linux/i.test(ua)) return 'Linux';
  return '';
}
const CONNECTION_NAME = `Figma Plugin${detectOS() ? ` ${detectOS()}` : ''}`;

// `name` (always) + `previewToken` (when available) advertised on the sender
// handshake. The server relays both to the phone on (re)establish — additive,
// so older servers/apps simply ignore them.
function identityParams(previewToken?: string | null): string {
  return (
    `&name=${encodeURIComponent(CONNECTION_NAME)}` +
    (previewToken ? `&previewToken=${encodeURIComponent(previewToken)}` : '')
  );
}

// Pairing flow for a phone that hasn't been linked yet. Once a token exists the
// panel is `paired` and this no longer drives the UI — the live `connected`
// flag does. Kept separate so a phone dropping out (`peer_disconnected`) flips
// the indicator off without discarding the pairing and forcing a re-scan.
type Phase = 'idle' | 'requesting' | 'awaiting-phone' | 'error';

export default function PhonePanel({
  token,
  onTokenChange,
  onConnectedChange,
  ensureSharedPreview,
  previewToken
}: {
  token: string | null;
  onTokenChange: (t: string | null) => void;
  // Reports the live link to the phone (distinct from being paired). The parent
  // gates "play on phone" on this so we don't broadcast into a dead channel.
  onConnectedChange?: (connected: boolean) => void;
  // Resolves (publishing if needed) this file's read-only preview token so the
  // unified QR can both open the live preview and pair playback. Resolves null
  // when the file isn't preview-ready — then we pair with the code alone.
  ensureSharedPreview: () => Promise<string | null>;
  // The current file's preview token; lets us relay it to an already-paired
  // phone once it first becomes available.
  previewToken: string | null;
}) {
  const [code, setCode] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  // Live link to the phone. Paired (token != null) but `connected === false`
  // means the phone is away — the server keeps our socket and will push
  // `connection_restored` when it returns.
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  // Preview token captured at pairing time, used to build the QR deterministically.
  const [pairPreviewToken, setPairPreviewToken] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  // The token our current socket is bound to. Lets the token effect below tell
  // "restored from storage" (open a socket) apart from "just paired" (the
  // pairing socket already owns it — don't reopen and churn the connection).
  const boundTokenRef = useRef<string | null>(null);
  // The preview token we last advertised to the phone, so a later change can be
  // relayed exactly once without re-opening the socket on every render.
  const lastSentPreviewRef = useRef<string | null>(null);

  const paired = token != null;

  useEffect(() => {
    onConnectedChange?.(connected);
  }, [connected, onConnectedChange]);

  // Build the unified QR: when a preview token is available it opens the live
  // preview *and* pairs playback (figma host); otherwise it pairs playback only
  // (connect host). Both carry the producer name for the phone's connection list.
  useEffect(() => {
    if (!code) return;
    // With a preview token: `figma` host so the app opens the live preview and
    // pairs. Without one: the root scheme (not the `connect` host), so the QR
    // stays backward compatible with apps already in the stores — they route
    // `pulsarapp:///` to their home screen and pair from `code` there.
    const deepLink = pairPreviewToken
      ? `pulsarapp://figma?token=${encodeURIComponent(pairPreviewToken)}` +
        `&code=${encodeURIComponent(code)}&name=${encodeURIComponent(CONNECTION_NAME)}`
      : `pulsarapp:///?code=${encodeURIComponent(code)}&name=${encodeURIComponent(CONNECTION_NAME)}`;
    QRCode.toDataURL(deepLink, {
      margin: 1,
      color: { dark: '#001a72', light: '#e1f3fa' },
      width: 220
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [code, pairPreviewToken]);

  // Open a sender socket and wire up the shared message handling + keepalive.
  // `params` selects new_connection (pairing) vs reuse_connection (restore).
  const openSocket = (params: string) => {
    wsRef.current?.close();
    const ws = new WebSocket(`${SOCKET_SERVER_URL}/?type=sender${params}`);
    wsRef.current = ws;

    const ping = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'ping' }));
    }, PING_INTERVAL_MS);
    ws.addEventListener('close', () => clearInterval(ping));

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        switch (msg.type) {
          // Fresh pairing completed — claim the token before handing it up so
          // the token effect sees the socket already bound and doesn't reopen.
          case 'connection_established':
            if (msg.token) {
              boundTokenRef.current = msg.token;
              onTokenChange(msg.token);
            }
            setConnected(true);
            setCode(null);
            setError(null);
            break;
          // Phone came back on a still-paired channel.
          case 'connection_restored':
            setConnected(true);
            setError(null);
            break;
          // Phone went away. Stay paired — the server holds our socket and will
          // send connection_restored when it returns.
          case 'peer_disconnected':
            setConnected(false);
            break;
        }
      } catch {}
    };
    ws.onerror = () => {
      setConnected(false);
      if (!paired) {
        setError('WebSocket error');
        setPhase('error');
      }
    };
    return ws;
  };

  // Persistent connection for an already-paired phone (restored from storage).
  // Skipped right after pairing, where the pairing socket already owns the token
  // (boundTokenRef), so we don't tear down a healthy connection.
  useEffect(() => {
    if (!token) {
      boundTokenRef.current = null;
      return;
    }
    if (boundTokenRef.current === token) return;
    boundTokenRef.current = token;
    lastSentPreviewRef.current = previewToken;
    openSocket(`&action=reuse_connection&token=${encodeURIComponent(token)}${identityParams(previewToken)}`);
    // previewToken is folded into the restore handshake; the dedicated effect
    // below handles it changing afterwards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Relay a preview token to an already-connected phone once it first becomes
  // available (e.g. the user adds the Figma file key after pairing). Re-opens
  // the sender socket with the token so the server pushes connection_restored —
  // carrying it — to the phone. Guarded so it fires only on a genuine change.
  useEffect(() => {
    if (!paired || !connected || !token || !previewToken) return;
    if (lastSentPreviewRef.current === previewToken) return;
    lastSentPreviewRef.current = previewToken;
    openSocket(`&action=reuse_connection&token=${encodeURIComponent(token)}${identityParams(previewToken)}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewToken, paired, connected, token]);

  useEffect(
    () => () => {
      wsRef.current?.close();
      wsRef.current = null;
    },
    []
  );

  const startPairing = async () => {
    setError(null);
    setPhase('requesting');
    try {
      // Resolve the preview token first so the unified QR can carry it.
      // Best-effort: a null result (file not preview-ready) just pairs playback.
      let preview: string | null = null;
      try {
        preview = await ensureSharedPreview();
      } catch {
        preview = null;
      }
      const r = await fetch(`${API_SERVER_URL}/create-channel`);
      const j = await r.json();
      if (!j.success) throw new Error('Server refused channel creation');
      const newCode: string = j.code;
      setPairPreviewToken(preview);
      lastSentPreviewRef.current = preview;
      setCode(newCode);
      setPhase('awaiting-phone');
      openSocket(`&action=new_connection&code=${newCode}${identityParams(preview)}`);
    } catch (e) {
      setError((e as Error).message);
      setPhase('error');
    }
  };

  const disconnect = () => {
    wsRef.current?.close();
    wsRef.current = null;
    boundTokenRef.current = null;
    lastSentPreviewRef.current = null;
    setConnected(false);
    onTokenChange(null);
    setCode(null);
    setPairPreviewToken(null);
    setPhase('idle');
  };

  return (
    <details className="accordion acc-row">
      <summary className="acc-head">
        <span className="acc-icon">
          <img src={iconSmartphone} alt="" />
        </span>
        <span className="acc-title">Phone</span>
        {paired && (
          <span className={`tag tag-flush ${connected ? 'active' : ''}`}>
            {connected ? 'Connected' : 'Offline'}
          </span>
        )}
        <span className="acc-chevron" aria-hidden="true">
          <img src={iconChevron} alt="" />
        </span>
      </summary>

      <div className="col acc-body">
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
              <button className="ghost" onClick={disconnect}>Disconnect</button>
            </div>
          </div>
        ) : (
          <>
            {phase === 'idle' && (
              <div className={styles['phone-card']}>
                <span className={styles['phone-card-ic']}>
                  <img src={iconSmartphone} alt="" />
                </span>
                <div className={styles['phone-card-main']}>
                  <div className={styles['phone-card-title']}>
                    <span className={styles['status-dot']} />
                    Not connected
                  </div>
                  <p className={styles['phone-card-text']}>
                    Pair the Pulsar app to feel real haptics on your device. If this file has a live
                    preview, scanning opens it on your phone too.
                  </p>
                  <button className="primary preset-action-btn" onClick={startPairing}>
                    <img src={iconQr} alt="" width={14} height={14} />
                    <span>Pair with phone</span>
                  </button>
                </div>
              </div>
            )}

            {phase === 'requesting' && (
              <div className={styles['phone-card']}>
                <span className={styles['phone-card-ic']}>
                  <img src={iconSmartphone} alt="" />
                </span>
                <div className={styles['phone-card-main']}>
                  <div className={styles['phone-card-title']}>
                    <span className={styles['status-dot']} />
                    Requesting channel…
                  </div>
                </div>
              </div>
            )}

            {phase === 'awaiting-phone' && (
              <div className={styles['phone-await']}>
                {qrDataUrl && <img className={styles['phone-qr']} src={qrDataUrl} alt="Scan with Pulsar" />}
                <div className="row">
                  <span className="muted">Code</span>
                  <span className={`mono ${styles['phone-code']}`}>{code}</span>
                </div>
                <p className={`${styles['phone-card-text']} ${styles['phone-await-hint']}`}>
                  Open the Pulsar mobile app and scan the QR (or enter the code).
                </p>
                <button className="ghost" onClick={disconnect}>Cancel</button>
              </div>
            )}

            {phase === 'error' && (
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
                  <button className="ghost" onClick={startPairing}>Retry</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </details>
  );
}

export async function broadcastToPhone(token: string, presetName: string) {
  try {
    await fetch(`${API_SERVER_URL}/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: presetName, token })
    });
  } catch (e) {
    console.warn('broadcast failed', e);
  }
}
